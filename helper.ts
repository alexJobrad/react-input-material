// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module helper */
'use strict'
/* !
    region header
    [Project page](https://torben.website/react-material-input)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import Tools from 'clientnode'
import {NullSymbol, UndefinedSymbol} from 'clientnode/property-types'
import {
    FirstParameter, Mapping, RecursivePartial, ValueOf
} from 'clientnode/type'
import {ReactElement, useMemo, useState} from 'react'
import {render as renderReact, unmountComponentAtNode} from 'react-dom'

import {
    BaseModel,
    BaseProperties,
    BaseProps,
    DataTransformSpecification,
    DefaultBaseProperties,
    DefaultInputProperties,
    FormatSpecification,
    InputDataTransformation,
    ModelState,
    ValueState
} from './type'
// endregion
/**
 * Creates a mocked a state setter. Useful to dynamically convert a component
 * from uncontrolled to controlled.
 *
 * @param value - Parameter for state setter.
 *
 * @returns Nothing.
 */
export const createDummyStateSetter = <
    Type = unknown
>(value:Type):ReturnType<typeof useState>[1] => (
    callbackOrData:FirstParameter<ReturnType<typeof useState>[1]>
):void => {
    if (typeof callbackOrData === 'function')
        callbackOrData(value)
}
/**
 * Consolidates properties not found in properties but in state into
 * properties.
 * @param properties - To consolidate.
 * @param state - To search values in.
 * @returns Consolidated properties.
 */
export const deriveMissingPropertiesFromState = <
    Properties extends BaseProps = BaseProps,
    State extends ValueState = ValueState
>(properties:Properties, state:State):Properties => {
    /*
        NOTE: Avoid writing into mutable model object properties. So project
        value to properties directly.
    */
    if (
        properties.model!.value !== undefined && properties.value === undefined
    )
        properties.value = properties.model!.value
    if (properties.value === undefined)
        properties.value = state.value

    if (properties.model!.state)
        properties.model!.state = {...properties.model!.state}
    else
        properties.model!.state = {} as ModelState

    for (const key in state.modelState)
        if (
            Object.prototype.hasOwnProperty.call(state.modelState, key) &&
            (
                properties.model!.state as Partial<ModelState>
            )[key as keyof ModelState] === undefined
        )
            properties.model!.state[key as keyof ModelState] =
                state.modelState[key as keyof ModelState]

    return properties
}
/**
 * Creates a hybrid a state setter wich only triggers when model state changes
 * occur. Useful to dynamically convert a component from uncontrolled to
 * controlled while model state should be uncontrolled either.
 *
 * @param setValueState - Value setter to wrap.
 * @param currentValueState - Last known value state to provide to setter when
 * called.
 *
 * @returns Wrapped given method.
 */
export const wrapStateSetter = <Type = any>(
    setValueState:(value:Type|((value:Type) => Type)) => void,
    currentValueState:Type
):ReturnType<typeof useState>[1] => (
    callbackOrData:FirstParameter<ReturnType<typeof useState>[1]>
) => {
    const result:Type = typeof callbackOrData === 'function' ?
        callbackOrData(currentValueState) :
        callbackOrData

    if (!Tools.equals(
        (result as unknown as {modelState:unknown})?.modelState,
        (currentValueState as unknown as {modelState:unknown})?.modelState
    ))
        setValueState(result)
}
/**
 * Triggered when a value state changes like validation or focusing.
 *
 * @param properties - Properties to search in.
 * @param name - Event callback name to search for in given properties.
 * @param synchronous - Indicates whether to trigger callback immediately or
 * later. Controlled components should call synchronously and uncontrolled
 * otherwise as long as callbacks are called in a state setter context.
 * @param parameters - Additional arguments to forward to callback.
 *
 * @returns Nothing.
 */
export const triggerCallbackIfExists = <
    P extends Omit<BaseProperties, 'model'> & {model:unknown}
>(
    properties:P,
    name:string,
    synchronous:boolean = true,
    ...parameters:Array<unknown>
):void => {
    name = `on${Tools.stringCapitalize(name)}`

    if (properties[name as keyof P])
        if (synchronous)
            (properties[name as keyof P] as unknown as Function)(...parameters)
        else
            Tools.timeout(() =>
                (properties[name as keyof P] as unknown as Function)(
                    ...parameters
                )
            )
}
// region consolidation state
/**
 * Translate known symbols in a copied and return properties object.
 * @param properties - Object to translate.
 * @returns Transformed properties.
 */
export const translateKnownSymbols = <Type = any>(
    properties:Mapping<typeof NullSymbol|Type|typeof UndefinedSymbol>
):Mapping<Type> => {
    const result:Mapping<Type> = {}
    for (const [name, value] of Object.entries(properties))
        if (value === UndefinedSymbol)
            (result[name] as unknown as undefined) = undefined
        else if (value === NullSymbol)
            (result[name] as unknown as null) = null
        else
            result[name] = Tools.copy(properties[name] as Type)
    return result
}
/**
 * Determines initial value depending on given properties.
 * @param properties - Components properties.
 * @param defaultValue - Internal fallback value.
 * @param alternateValue - Alternate value to respect.
 * @returns Determined value.
 */
export const determineInitialValue = <Type = any>(
    properties:BaseProps,
    defaultValue?:null|Type,
    alternateValue?:null|Type
):null|Type => {
    if (alternateValue !== undefined)
        return alternateValue as null|Type
    if (properties.value !== undefined)
        return properties.value as null|Type
    if (properties.model?.value !== undefined)
        return properties.model!.value as null|Type
    if (properties.initialValue !== undefined)
        return Tools.copy(properties.initialValue as null|Type)
    if (properties.default !== undefined)
        return Tools.copy(properties.default as null|Type)
    if (properties.model?.default !== undefined)
        return Tools.copy(properties.model!.default as null|Type)
    if (defaultValue !== undefined)
        return defaultValue
    return null
}
/**
 * Derives current validation state from given value.
 * @param properties - Input configuration.
 * @param currentState - Current validation state.
 * @param validators - Mapping from validation state key to corresponding
 * validator function.
 * @returns A boolean indicating if validation state has changed.
 */
export const determineValidationState = <
    P extends DefaultBaseProperties = DefaultBaseProperties,
    MS extends Partial<ModelState> = Partial<ModelState>
>(
    properties:P, currentState:MS, validators:Mapping<() => boolean> = {}
):boolean => {
    let changed:boolean = false

    validators = {
        invalidRequired: ():boolean => (
            properties.model.nullable === false &&
            (
                properties.model.type !== 'boolean' &&
                !properties.model.value
            ) ||
            (
                properties.model.type === 'boolean' &&
                !(
                    typeof properties.model.value === 'boolean' ||
                    ['false', 'true'].includes(
                        properties.model.value as unknown as string
                    )
                )
            )
        ),
        ...validators
    }

    properties.model.state = properties.model.state || {} as MS
    for (const [name, validator] of Object.entries(validators)) {
        const oldValue:boolean|undefined =
            currentState[name as keyof ModelState]
        properties.model.state[name as keyof ModelState] = validator()
        changed =
            changed || oldValue !== currentState[name as keyof ModelState]
    }

    if (changed) {
        properties.model.state.invalid =
            Object.keys(validators).some((name:string):boolean =>
                properties.model.state[name as keyof ModelState]
            )
        properties.model.state.valid = !properties.model.state.invalid
    }

    return changed
}
/**
 * Synchronizes property, state and model configuration:
 * Properties overwrites default properties which overwrites default model
 * properties.
 * @param properties - Properties to merge.
 * @param defaultModel - Default model to merge.
 * @returns Merged properties.
*/
export const mapPropertiesIntoModel = <
    P extends BaseProps = BaseProps,
    DP extends DefaultBaseProperties = DefaultBaseProperties
>(properties:P, defaultModel:DP['model']):DP => {
    /*
        NOTE: Default props seems not to respect nested layers to merge so we
        have to manage this for nested model structure.
    */
    const result:DP =
        Tools.extend(true, {model: Tools.copy(defaultModel)}, properties)
    // region handle aliases
    if (result.disabled) {
        result.model.mutable = false
        delete result.disabled
    }
    if (result.invertedPattern) {
        result.model.invertedRegularExpressionPattern = result.invertedPattern
        delete result.invertedPattern
    }
    if (result.pattern) {
        result.model.regularExpressionPattern = result.pattern
        delete result.pattern
    }
    if (result.required) {
        result.model.nullable = false
        delete result.required
    }
    if (result.type === 'text')
        result.type = 'string'
    // endregion
    // region map properties into model
    // Map first level properties
    for (const name of Object.keys(result.model).concat('value'))
        if (
            Object.prototype.hasOwnProperty.call(result, name) &&
            result[name as keyof DP] !== undefined
        )
            (result.model[name as keyof BaseModel] as ValueOf<DP['model']>) =
                result[name as keyof DP] as unknown as ValueOf<DP['model']>
    // Map property state into model state
    for (const name in result.model.state)
        if (
            Object.prototype.hasOwnProperty.call(result, name) &&
            result[name as keyof ModelState] !== undefined
        )
            result.model.state[name as keyof ModelState] =
                result[name as keyof DP] as unknown as ValueOf<ModelState>

    if (result.model.value === undefined)
        result.model.value = Tools.copy(result.model.default)
    // else -> Controlled component via model's "value" property.
    // endregion
    return result
}
/**
 * Calculate external properties (a set of all configurable properties).
 * @param properties - Properties to merge.
 * @returns External properties object.
 */
export const getConsolidatedProperties = <
    P extends BaseProps, R extends BaseProperties
>(properties:P):R => {
    const result:R & Partial<R['model']> = ({
        ...properties,
        ...(properties.model || {}),
        ...((properties.model || {}).state || {})
    }) as unknown as R & Partial<R['model']>
    // region handle aliases
    result.disabled = !(result.mutable && result.writable)
    delete result.mutable
    delete result.writable

    delete result.state

    result.required = !result.nullable
    delete result.nullable

    if (result.invertedRegularExpressionPattern)
        result.invertedPattern = result.invertedRegularExpressionPattern
    // NOTE: Workaround since optional type configuration above is ignored.
    delete (result as {invertedRegularExpressionPattern?:RegExp|string})
        .invertedRegularExpressionPattern
    if (result.regularExpressionPattern)
        result.pattern = result.regularExpressionPattern
    // NOTE: Workaround since optional type configuration above is ignored.
    delete (result as {regularExpressionPattern?:RegExp|string})
        .regularExpressionPattern
    // endregion
    return result
}
// endregion
// region value transformer
/**
 * Applies configured value transformations.
 *
 * @param configuration - Input configuration.
 * @param value - Value to transform.
 * @param transformer - To apply to given value.
 *
 * @returns Transformed value.
 */
export const parseValue = <
    T = unknown,
    P extends DefaultInputProperties<T> = DefaultInputProperties<T>,
    InputType = T
>(
    configuration:P,
    value:null|InputType,
    transformer:InputDataTransformation
):null|T => {
    if (configuration.model.trim && typeof value === 'string')
        (value as string) = value.trim().replace(/ +\n/g, '\\n')

    if (
        configuration.model.emptyEqualsNull &&
        value as unknown as string === ''
    )
        return null

    let result:null|T = value as unknown as null|T
    if (
        ![null, undefined].includes(value as null) &&
        transformer[
            configuration.model.type as keyof InputDataTransformation
        ]?.parse
    )
        result = (
            transformer[
                configuration.model.type as keyof InputDataTransformation
            ]!.parse as
                unknown as
                DataTransformSpecification<T, InputType>['parse']
        )!(value as InputType, configuration, transformer)

    if (typeof result === 'number' && isNaN(result))
        return null

    return result
}
/**
 * Represents configured value as string.
 *
 * @param configuration - Input configuration.
 * @param value - To represent.
 * @param transformer - To apply to given value.
 * @param final - Specifies whether it is a final representation.
 *
 * @returns Transformed value.
 */
export function formatValue<
    T = unknown,
    P extends DefaultInputProperties<T> = DefaultInputProperties<T>
>(
    configuration:P,
    value:null|T,
    transformer:InputDataTransformation,
    final:boolean = true
):string {
    const methodName:'final'|'intermediate' = final ? 'final' : 'intermediate'

    if (
        [null, undefined].includes(value as null) ||
        typeof value === 'number' && isNaN(value)
    )
        return ''

    if (
        transformer[
            (configuration.type || configuration.model.type) as
                keyof InputDataTransformation
        ]?.format &&
        transformer[
            (configuration.type || configuration.model.type) as
                keyof InputDataTransformation
        ]!.format![methodName]?.transform
    )
        return (
            transformer[
                (configuration.type || configuration.model.type) as
                    keyof InputDataTransformation
            ]!.format![methodName]!.transform as
                FormatSpecification<T>['transform']
        )!(value as T, configuration, transformer)

    return String(value)
}
/**
 * Determines initial value representation as string.
 *
 * @param properties - Components properties.
 * @param defaultProperties - Components default properties.
 * @param value - Current value to represent.
 * @param transformer - To apply to given value.
 *
 * @returns Determined initial representation.
 */
export function determineInitialRepresentation<
    T = unknown,
    P extends DefaultInputProperties<T> = DefaultInputProperties<T>
>(
    properties:P,
    defaultProperties:P,
    value:null|T,
    transformer:InputDataTransformation,
):string {
    if (typeof properties.representation === 'string')
        return properties.representation

    if (value !== null)
        return formatValue<T, P & {type:string}>(
            {
                ...properties,
                type: (
                    properties.type ||
                    properties.model?.type ||
                    defaultProperties.model.type
                )
            },
            value,
            transformer
        )

    return ''
}
// endregion
// region hooks
/**
 * Custom hook to memorize any values with a default empty array. Useful if
 * using previous constant complex object within a render function.
 * @param value - Value to memorize.
 * @param dependencies - Optional dependencies when to update given value.
 * @returns Given cached value.
 */
export const useMemorizedValue = <T = unknown>(
    value:T, ...dependencies:Array<unknown>
):T => useMemo(():T => value, dependencies)
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
