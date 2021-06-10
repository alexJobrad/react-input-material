// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module Interval */
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
import {Icon} from '@rmwc/icon'
import {IconOptions} from '@rmwc/types'
import {
    createRef,
    ForwardedRef,
    forwardRef,
    memo as memorize,
    ReactElement,
    RefObject,
    useImperativeHandle,
    useState
} from 'react'

import GenericInput from './GenericInput'
import styles from './Interval.module'
import WrapConfigurations from './WrapConfigurations'
import {
    createDummyStateSetter, translateKnownSymbols, triggerCallbackIfExists
} from '../helper'
import {
    defaultIntervalProperties as defaultProperties,
    GenericEvent,
    InputModel,
    InputProps,
    InputProperties,
    InputAdapterWithReferences,
    IntervalAdapter as Adapter,
    IntervalAdapterWithReferences as AdapterWithReferences,
    IntervalModelState as ModelState,
    IntervalProperties as Properties,
    intervalPropertyTypes as propertyTypes,
    IntervalProps as Props,
    IntervalValue as Value,
    StaticFunctionInputComponent as StaticComponent
} from '../type'
// endregion
// region helper
const getModelState = (
    startProperties:InputProperties<number>,
    endProperties:InputProperties<number>
):ModelState => ({
    dirty: startProperties.dirty || endProperties.dirty,
    focused: startProperties.focused || endProperties.focused,
    invalid: startProperties.invalid || endProperties.invalid,
    invalidRequired:
        startProperties.invalidRequired ||
        endProperties.invalidRequired,
    pristine: startProperties.pristine && endProperties.pristine,
    touched: startProperties.touched || endProperties.touched,
    untouched: startProperties.untouched && endProperties.untouched,
    valid: startProperties.valid && endProperties.valid,
    visited: startProperties.visited || endProperties.visited
})
const getExternalProperties = (
    properties:Properties,
    iconProperties:IconOptions,
    startProperties:InputProperties<number>,
    endProperties:InputProperties<number>
):Properties => {
    const modelState:ModelState =
        getModelState(startProperties, endProperties)
    const value:Value = {
        end: endProperties.value, start: startProperties.value
    }

    return {
        ...properties,
        ...modelState,
        icon: iconProperties,
        model: {
            name: properties.name,
            state: modelState,
            value: {
                end: endProperties.model,
                start: startProperties.model
            }
        },
        value: {
            end: endProperties,
            start: startProperties
        }
    }
}
// endregion
/**
 * Generic interval start, end input wrapper component.
 *
 * @property static:displayName - Descriptive name for component to show in web
 * developer tools.
 *
 * @param props - Given components properties.
 * @param reference - Reference object to forward internal state.
 * @returns React elements.
 */
export const IntervalInner = ((
    props:Props, reference?:ForwardedRef<Adapter>
):ReactElement => {
    // region consolidate properties
    const givenProps:Props = translateKnownSymbols(props) as Props
    /*
        Normalize value property (providing only value instead of props is
        allowed also).
    */
    if (!givenProps.value)
        givenProps.value = {
            end: {value: givenProps.value}, start: {value: givenProps.value}
        }
    if (typeof givenProps.value.end === 'number')
        givenProps.value.end = {value: givenProps.value.end}
    if (typeof givenProps.value.start === 'number')
        givenProps.value.start = {value: givenProps.value.start}
    /*
        NOTE: Extend default properties with given properties while letting
        default property object untouched for unchanged usage in other
        instances.
    */
    const properties:Omit<Props, 'value'> & {value: Properties['value']} =
        Tools.extend(
            true, Tools.copy(Interval.defaultProperties), givenProps
        ) as Properties

    let endProperties:InputProps<number> = properties.value?.end || {}
    const iconProperties:IconOptions = typeof properties.icon === 'string' ?
        {icon: properties.icon} :
        properties.icon!
    let startProperties:InputProps<number> = properties.value?.start || {}

    /*
        NOTE: Sometimes we need real given properties or derived (default
        extended) "given" properties.
    */
    const controlled:boolean =
        !properties.enforceUncontrolled &&
        (
            givenProps.model?.value?.end?.value !== undefined ||
            givenProps.model?.value?.start?.value !== undefined ||
            givenProps.value !== undefined
        ) &&
        Boolean(properties.onChange || properties.onChangeValue)

    let [value, setValue] = useState<Value>({
        end:
            endProperties.value ??
            properties.model?.value?.end?.value ??
            endProperties.default ??
            properties.model?.value?.end?.default ??
            null,
        start:
            startProperties.value ??
            properties.model?.value?.end?.value ??
            startProperties.default ??
            properties.model?.value?.start?.default ??
            null,
    })
    if (!properties.value)
        properties.value =
            {end: {value: value.end}, start: {value: value.start}}
    const propertiesToForward:InputProps<number> =
        Tools.mask<InputProps<number>>(
            properties as unknown as InputProps<number>,
            {exclude: {
                className: true,
                enforceUncontrolled: true,
                end: true,
                icon: true,
                start: true,
                model: true,
                name: true,
                onChange: true,
                onChangeValue: true,
                style: true,
                value: true
            }}
        )

    endProperties = Tools.extend(
        true,
        {},
        propertiesToForward,
        properties.model?.value?.end ? {model: properties.model.value.end} : {},
        endProperties
    )
    startProperties = Tools.extend(
        true,
        {},
        propertiesToForward,
        properties.model?.value?.start ?
            {model: properties.model.value.start} :
            {},
        startProperties
    )

    if (!endProperties.className)
        endProperties.className = `${styles.interval}__end`
    if (!iconProperties.className)
        iconProperties.className = `${styles.interval}__icon`
    if (!startProperties.className)
        startProperties.className = `${styles.interval}__start`

    const endConfiguration = {...endProperties.model, ...endProperties}
    const startConfiguration = {...startProperties.model, ...startProperties}

    startProperties.maximum = Math.min(
        typeof startConfiguration.maximum === 'number' ?
            startConfiguration.maximum :
            Infinity,
        properties.value.end.value || Infinity,
        typeof endConfiguration.maximum === 'number' ?
            endConfiguration.maximum :
            Infinity
    )
    startProperties.minimum = startConfiguration.minimum || -Infinity
    startProperties.value = properties.value.start.value

    endProperties.maximum = typeof endConfiguration.maximum === 'number' ?
        endConfiguration.maximum :
        Infinity
    endProperties.minimum = Math.max(
        typeof endConfiguration.minimum === 'number' ?
            endConfiguration.minimum :
            -Infinity,
        properties.value.start.value || -Infinity,
        typeof startConfiguration.minimum === 'number' ?
            startConfiguration.minimum :
            -Infinity
    )
    endProperties.value = properties.value.end.value

    const endInputReference:RefObject<InputAdapterWithReferences<number>> =
        createRef<InputAdapterWithReferences<number>>()
    const startInputReference:RefObject<InputAdapterWithReferences<number>> =
        createRef<InputAdapterWithReferences<number>>()

    const valueState:Value = {
        end: properties.value.end.value,
        start: properties.value.start.value
     }
    if (controlled)
        /*
            NOTE: We act as a controlled component by overwriting internal
            state setter.
        */
        setValue = createDummyStateSetter<Value>(valueState)
    // endregion
    useImperativeHandle(
        reference,
        ():AdapterWithReferences => ({
            properties: getExternalProperties(
                properties as Properties,
                iconProperties,
                endInputReference.current?.properties ||
                properties.value.end as InputProperties<number>,
                startInputReference.current?.properties ||
                properties.value.start as InputProperties<number>
            ),
            references: {end: endInputReference, start: startInputReference},
            state: controlled ? {} : {value: valueState}
        })
    )
    // region attach event handler
    if (properties.onChange) {
        endProperties.onChange = (
            inputProperties:InputProperties<number>, event?:GenericEvent
        ):void => {
            const start:InputProperties<number> =
                startInputReference.current?.properties ||
                startProperties as unknown as InputProperties<number>
            start.value = Math.min(
                startInputReference.current?.properties?.value ?? Infinity,
                inputProperties.value ?? Infinity
            )

            triggerCallbackIfExists<Properties>(
                properties as Properties,
                'change',
                controlled,
                getExternalProperties(
                    properties as Properties,
                    iconProperties,
                    start,
                    inputProperties
                ),
                event,
                properties
            )
        }
        startProperties.onChange = (
            inputProperties:InputProperties<number>, event?:GenericEvent
        ):void => {
            const end:InputProperties<number> =
                endInputReference.current?.properties ||
                endProperties as unknown as InputProperties<number>
            end.value = Math.max(
                endInputReference.current?.properties?.value ?? -Infinity,
                inputProperties.value ?? -Infinity
            )

            triggerCallbackIfExists<Properties>(
                properties as Properties,
                'change',
                controlled,
                getExternalProperties(
                    properties as Properties,
                    iconProperties,
                    inputProperties,
                    end
                ),
                event,
                properties
            )
        }
    }

    endProperties.onChangeValue = (
        value:null|number, event?:GenericEvent
    ):void => {
        const startValue:number = Math.min(
            startInputReference.current?.properties?.value ?? Infinity,
            value ?? Infinity
        )
        const newValue:Value = {
            end: value, start: isFinite(startValue) ? startValue : value
        }

        triggerCallbackIfExists<Properties>(
            properties as Properties,
            'changeValue',
            controlled,
            newValue,
            event,
            properties
        )

        setValue(newValue)
    }
    startProperties.onChangeValue = (
        value:null|number, event?:GenericEvent
    ):void => {
        const endValue:number = Math.max(
            endInputReference.current?.properties?.value ?? -Infinity,
            value ?? -Infinity
        )
        const newValue:Value = {
            end: isFinite(endValue) ? endValue : value, start: value
        }

        triggerCallbackIfExists<Properties>(
            properties as Properties,
            'changeValue',
            controlled,
            newValue,
            event,
            properties
        )

        setValue(newValue)
    }
    // endregion
    return <WrapConfigurations
        strict={Interval.strict}
        themeConfiguration={properties.themeConfiguration}
    >
        <div
            className={[styles.interval]
                .concat(
                    properties.className ?? [],
                    properties.disabled ? styles['interval--disabled'] : []
                )
                .join(' ')
            }
            data-name={properties.name}
            style={properties.style}
        >
            <GenericInput
                {...startProperties} ref={startInputReference as any}
            />
            <Icon icon={iconProperties} />
            <GenericInput {...endProperties} ref={endInputReference as any} />
        </div>
    </WrapConfigurations>
})
// NOTE: This is useful in react dev tools.
IntervalInner.displayName = 'Interval'
/**
 * Wrapping web component compatible react component.
 * @property static:defaultProperties - Initial property configuration.
 * @property static:propTypes - Triggers reacts runtime property value checks
 * @property static:strict - Indicates whether we should wrap render output in
 * reacts strict component.
 * @property static:wrapped - Wrapped component.
 *
 * @param props - Given components properties.
 * @param reference - Reference object to forward internal state.
 * @returns React elements.
 */
export const Interval:StaticComponent<Props> =
    memorize(forwardRef(IntervalInner)) as unknown as StaticComponent<Props>
// region static properties
// / region web-component hints
Interval.wrapped = IntervalInner
Interval.webComponentAdapterWrapped = 'react'
// / endregion
Interval.defaultProperties = defaultProperties
Interval.propTypes = propertyTypes
Interval.strict = false
// endregion
export default Interval
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
