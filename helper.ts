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
import {FirstParameter, Mapping, ValueOf} from 'clientnode/type'
import {useMemo, useState} from 'react'
import {
    FormattedOption as FormattedSelectionOption, SelectProps
} from '@rmwc/select'

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
 * @param value - Parameter for state setter.
 *
 * @returns Nothing.
 */
export const createDummyStateSetter =
    <Type = unknown>(value:Type):ReturnType<typeof useState>[1] =>
        (
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
 *
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

    for (const [key, value] of Object.entries(state.modelState))
        if ((
            properties.model!.state as Partial<ModelState>
        )[key as keyof ModelState] === undefined)
            properties.model!.state[key as keyof ModelState] =
                value as ValueOf<ModelState>

    return properties
}
/**
 * Creates a hybrid a state setter wich only triggers when model state changes
 * occur. Useful to dynamically convert a component from uncontrolled to
 * controlled while model state should be uncontrolled either.
 * @param setValueState - Value setter to wrap.
 * @param currentValueState - Last known value state to provide to setter when
 * called.
 *
 * @returns Wrapped given method.
 */
export const wrapStateSetter = <Type = unknown>(
    setValueState:(_value:Type|((_value:Type) => Type)) => void,
    currentValueState:Type
):ReturnType<typeof useState>[1] =>
        (
            callbackOrData:FirstParameter<ReturnType<typeof useState>[1]>
        ):void => {
            const result:Type = (typeof callbackOrData === 'function' ?
                callbackOrData(currentValueState) :
                callbackOrData
            ) as Type

            if (!Tools.equals(
                (result as unknown as {modelState:unknown})?.modelState,
                (
                    currentValueState as unknown as {modelState:unknown}
                )?.modelState
            ))
                setValueState(result)
        }
/**
 * Triggered when a value state changes like validation or focusing.
 * @param properties - Properties to search in.
 * @param name - Event callback name to search for in given properties.
 * @param synchronous - Indicates whether to trigger callback immediately or
 * later. Controlled components should call synchronously and uncontrolled
 * otherwise as long as callbacks are called in a state setter context.
 * @param parameters - Additional arguments to forward to callback.
 *
 * @returns Nothing.
 */
export const triggerCallbackIfExists =
    <P extends Omit<BaseProperties, 'model'> & {model:unknown}>(
        properties:P,
        name:string,
        synchronous = true,
        ...parameters:Array<unknown>
    ):void => {
        name = `on${Tools.stringCapitalize(name)}`

        if (properties[name as keyof P])
            if (synchronous)
                (properties[name as keyof P] as
                    unknown as
                    (..._parameters:Array<unknown>) => void
                )(...parameters)
            else
                void Tools.timeout(() =>
                    (properties[name as keyof P] as
                        unknown as
                        (..._parameters:Array<unknown>) => void
                    )(...parameters)
                )
    }
// region consolidation state
/**
 * Translate known symbols in a copied and return properties object.
 * @param properties - Object to translate.
 *
 * @returns Transformed properties.
 */
export const translateKnownSymbols = <Type = unknown>(
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
 *
 * @returns Determined value.
 */
export const determineInitialValue = <Type = unknown>(
    properties:BaseProps,
    defaultValue?:null|Type,
    alternateValue?:null|Type
):null|Type => {
    if (alternateValue !== undefined)
        return alternateValue

    if (properties.value !== undefined)
        return properties.value as null|Type

    if (properties.model?.value !== undefined)
        return properties.model.value as null|Type

    if (properties.initialValue !== undefined)
        return Tools.copy(properties.initialValue as null|Type)

    if (properties.default !== undefined)
        return Tools.copy(properties.default as null|Type)

    if (properties.model?.default !== undefined)
        return Tools.copy(properties.model.default as null|Type)

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
 *
 * @returns A boolean indicating if validation state has changed.
 */
export const determineValidationState =
    <
        P extends DefaultBaseProperties = DefaultBaseProperties,
        MS extends Partial<ModelState> = Partial<ModelState>
    >(
        properties:P, currentState:MS, validators:Mapping<() => boolean> = {}
    ):boolean => {
        let changed = false

        validators = {
            invalidRequired: ():boolean => (
                properties.model.nullable === false &&
                (
                    properties.model.type !== 'boolean' &&
                    !properties.model.value &&
                    properties.model.value !== 0
                ) ||
                (
                    properties.model.type === 'boolean' &&
                    !(
                        typeof properties.model.value === 'boolean' ||
                        ['false', 'true'].includes(
                            properties.model.value as string
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
 *
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
    const result:DP = Tools.extend<DP>(
        true,
        {model: Tools.copy<DP['model']>(defaultModel)} as DP,
        properties as DP
    )
    // region handle  aliases
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
 *
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
/// region selection
/**
 * Determine normalized labels and values for selection and auto-complete
 * components.
 * @param selection - Selection component property configuration.
 *
 * @returns Normalized sorted listed of labels and values.
 */
export function getLabelAndValues(
    selection?:SelectProps['options']|Array<{label?:string;value:unknown}>
):[Array<string>, Array<unknown>] {
    if (Array.isArray(selection)) {
        const labels:Array<string> = []
        const values:Array<unknown> = []

        for (const value of selection)
            if (['number', 'string'].includes(typeof value)) {
                labels.push(`${value as string}`)
                values.push(value)
            } else if (typeof (value as {label:string})?.label === 'string') {
                labels.push((value as {label:string}).label)
                values.push((value as {value:unknown}).value)
            } else if (['number', 'string'].includes(
                typeof (value as {value:string})?.value
            )) {
                labels.push(`${(value as {value:string}).value}`)
                values.push((value as {value:string}).value)
            }

        return [labels, values]
    }

    if (selection !== null && typeof selection === 'object') {
        const values:Array<string> = Object.keys(selection).sort(
            (first:string, second:string):number =>
                selection[first].localeCompare(selection[second])
        )
        return [values.map((value:string) => selection[value]), values]
    }

    return [[], []]
}
/**
 * Determine representation for given value while respecting existing labels.
 * @param value - To represent.
 * @param selection - Selection component property configuration.
 *
 * @returns Determined representation.
 */
export function getRepresentationFromValueSelection(
    value:unknown,
    selection?:SelectProps['options']|Array<{label?:string;value:unknown}>
):null|string {
    if (selection) {
        if (Array.isArray(selection))
            for (const option of selection) {
                if (Tools.equals(option, value))
                    return `${value as string}`

                if (Tools.equals((option as {value:unknown})?.value, value))
                    return (
                        (option as {label:string}).label ||
                        `${value as string}`
                    )
            }

        if (
            selection !== null &&
            typeof selection === 'object' &&
            typeof value === 'string' &&
            Object.prototype.hasOwnProperty.call(selection, value)
        )
            return (selection as Mapping)[value]
    }

    return null
}
/**
 * Determine value from provided representation (for example user inputs).
 * @param label - To search a value for.
 * @param selection - Selection component property configuration.
 *
 * @returns Determined value.
 */
export function getValueFromSelection<T>(
    label:string,
    selection:SelectProps['options']|Array<{label?:string;value:unknown}>
):null|T {
    if (Array.isArray(selection))
        for (const value of selection) {
            if (
                ['number', 'string'].includes(typeof value) &&
                `${value as string}` === label
            )
                return value as unknown as T

            if (
                typeof (value as {label:string})?.label === 'string' &&
                (value as {label:string}).label === label
            )
                return (value as {value:T}).value

            if (
                ['number', 'string'].includes(
                    typeof (value as {value:string})?.value
                ) &&
                `${(value as {value:string}).value}` === label
            )
                return (value as {value:T}).value
        }

    if (selection !== null && typeof selection === 'object')
        for (const [value, selectionLabel] of Object.entries(selection))
            if (selectionLabel === label)
                return value as unknown as T

    return null
}
/**
 * Normalize given selection.
 * @param selection - Selection component property configuration.
 * @param labels - Additional labels to take into account (for example provided
 * via a content management system).
 *
 * @returns Determined normalized selection configuration.
 */
export function normalizeSelection(
    selection?:(
        Array<[string, string]> |
        SelectProps['options'] |
        Array<{label?:string;value:unknown}>
    ),
    labels?:Array<string>|Mapping
):SelectProps['options']|Array<{label?:string;value:unknown}>|undefined {
    if (!selection) {
        selection = labels
        labels = undefined
    }

    if (Array.isArray(selection) && selection.length) {
        const result:Array<FormattedSelectionOption> = []
        let index = 0
        if (Array.isArray(selection[0]))
            for (
                const [value, label] of selection as Array<[string, string]>
            ) {
                result.push({
                    label: Array.isArray(labels) && index < labels.length ?
                        labels[index] :
                        label,
                    value
                })

                index += 1
            }
        else if (selection[0] !== null && typeof selection[0] === 'object')
            for (
                const option of selection as Array<FormattedSelectionOption>
            ) {
                result.push({
                    ...(option),
                    label: Array.isArray(labels) && index < labels.length ?
                        labels[index] :
                        option.label
                })

                index += 1
            }
        else
            for (const value of selection as Array<string>) {
                result.push({
                    label: Array.isArray(labels) && index < labels.length ?
                        labels[index] :
                        value,
                    value
                })

                index += 1
            }

        selection = result
    }

    if (labels !== null && typeof labels === 'object') {
        if (Array.isArray(selection)) {
            const result:Array<FormattedSelectionOption> = []

            for (const option of selection as Array<FormattedSelectionOption>)
                result.push({
                    ...option,
                    label: Object.prototype.hasOwnProperty.call(
                        labels, (option.value || option.label) as string
                    ) ?
                        (
                            labels as Mapping
                        )[(option.value || option.label) as string] :
                        // Map boolean values to their string representation.
                        (
                            (option as unknown as {value:boolean}).value ===
                                true &&
                            (labels as {true:string}).true
                        ) ?
                            (labels as {true:string}).true :
                            (
                                (
                                    option as unknown as {value:boolean}
                                ).value === false &&
                                (labels as {false:string}).false
                            ) ?
                                (labels as {false:string}).false :
                                option.label
                })

            return result
        }

        for (const [value, label] of Object.entries(selection as Mapping))
            (selection as Mapping)[value] =
                Object.prototype.hasOwnProperty.call(labels, value) ?
                    (labels as Mapping)[value] :
                    label
    }

    return selection as
        SelectProps['options']|Array<{label?:string;value:unknown}>|undefined
}
/// endregion
/**
 * Applies configured value transformations.
 * @param configuration - Input configuration.
 * @param value - Value to transform.
 * @param transformer - To apply to given value.
 *
 * @returns Transformed value.
 */
export const parseValue =
    <
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
    final = true
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
 * @param properties - Components properties.
 * @param defaultProperties - Components default properties.
 * @param value - Current value to represent.
 * @param transformer - To apply to given value.
 * @param selection - Data mapping of allowed values.
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
    selection?:SelectProps['options']|Array<{label?:string;value:unknown}>
):string {
    if (typeof properties.representation === 'string')
        return properties.representation

    if (value !== null) {
        const candidate:null|string =
            getRepresentationFromValueSelection(value, selection)

        if (typeof candidate === 'string')
            return candidate

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
    }

    return ''
}
// endregion
// region hooks
/**
 * Custom hook to memorize any values with a default empty array. Useful if
 * using previous constant complex object within a render function.
 * @param value - Value to memorize.
 * @param dependencies - Optional dependencies when to update given value.
 *
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
