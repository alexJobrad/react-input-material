// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module requireable-checkbox */
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
import React, {
    createRef,
    FocusEvent as ReactFocusEvent,
    forwardRef,
    ForwardRefRenderFunction,
    FunctionComponent,
    memo as memorize,
    MouseEvent as ReactMouseEvent,
    ReactElement,
    RefCallback,
    RefObject,
    SyntheticEvent,
    useImperativeHandle,
    useState
} from 'react'
import {MDCCheckboxFoundation} from '@material/checkbox'
import {Checkbox} from '@rmwc/checkbox'
import '@rmwc/checkbox/styles'
import {Theme} from '@rmwc/theme'

import {WrapConfigurations} from './WrapConfigurations'
import {
    determineInitialValue,
    determineValidationState,
    getConsolidatedProperties as getBaseConsolidatedProperties,
    mapPropertiesIntoModel,
    triggerCallbackIfExists
} from '../helper'
import {
    CheckboxAdapter,
    CheckboxModel as Model,
    CheckboxProperties as Properties,
    CheckboxProps as Props,
    CheckboxState as State,
    defaultModelState,
    DefaultCheckboxProperties as DefaultProperties,
    defaultCheckboxProperties as defaultProperties,
    CheckboxModelState as ModelState,
    checkboxPropertyTypes as propertyTypes,
    StaticFunctionComponent as StaticComponent,
    ValueState
} from '../type'
// endregion
/**
 * Validateable checkbox wrapper component.
 *
 * @property static:displayName - Descriptive name for component to show in web
 * developer tools.
 *
 * Dataflow:
 *
 * 1. On-Render all states are merged with given properties into a normalized
 *    properties object.
 * 2. Properties, corresponding state values and sub node instances are saved
 *    into a "ref" object (to make them accessible from the outside e.g. for
 *    wrapper like web-components).
 * 3. Event handler saves corresponding data modifications into state and
 *    normalized properties object.
 * 4. All state changes except selection changes trigger an "onChange" event
 *    which delivers the consolidated properties object (with latest
 *    modifications included).
 *
 * @property static:displayName - Descriptive name for component to show in web
 * developer tools.
 *
 * @param props - Given components properties.
 * @param reference - Reference object to forward internal state.
 * @returns React elements.
 */
export const RequireableCheckboxInner = function(
    props:Props, reference?:RefObject<CheckboxAdapter>
):ReactElement {
    // region property aggregation
    /**
     * Calculate external properties (a set of all configurable properties).
     * @param properties - Properties to merge.
     * @returns External properties object.
     */
    const getConsolidatedProperties = (properties:Props):Properties => {
        let result:Props = mapPropertiesIntoModel<Props, Model>(
            properties,
            RequireableCheckbox.defaultProps.model as Model,
            props
        )

        determineValidationState<Properties>(
            result as Properties, result.model!.state as ModelState
        )

        result = getBaseConsolidatedProperties<Props, Properties>(result)

        result.checked = result.value

        return result as Properties
    }
    // endregion
    // region event handler
    /**
     * Triggered on blur events.
     * @param event - Event object.
     * @returns Nothing.
     */
    const onBlur = (event:SyntheticEvent):void => setValueState((
        oldValueState:ValueState<boolean, ModelState>
    ):ValueState<boolean, ModelState> => {
        let changed:boolean = false

        if (oldValueState.model.focused) {
            properties.focused = false
            changed = true
        }

        if (!oldValueState.model.visited) {
            properties.visited = true
            changed = true
        }

        if (changed) {
            onChange(event)
            triggerCallbackIfExists<boolean>(
                properties, 'changeState', properties.model.state, event
            )
        }

        triggerCallbackIfExists<boolean>(properties, 'blur', event)

        return changed ?
            {...oldValueState, model: properties.model.state} :
            oldValueState
    })
    /**
     * Triggered on any change events.
     * @param event - Potential event object.
     * @returns Nothing.
     */
    const onChange = (event?:SyntheticEvent):void => {
        Tools.extend(
            true,
            properties,
            getConsolidatedProperties(
                /*
                    Workaround since "Type" isn't identified as subset of
                    "RecursivePartial<Type>" yet.
                */
                properties as unknown as Props
            )
        )

        triggerCallbackIfExists<boolean>(properties, 'change', event)
    }
    /**
     * Triggered when show declaration indicator should be changed.
     * @param event - Potential event object.
     * @returns Nothing.
     */
    const onChangeShowDeclaration = (event?:ReactMouseEvent):void =>
        setShowDeclaration((value:boolean):boolean => {
            properties.showDeclaration = !value

            onChange(event)

            triggerCallbackIfExists<boolean>(
                properties,
                'changeShowDeclaration',
                properties.showDeclaration,
                event
            )

            return properties.showDeclaration
        })
    /**
     * Triggered when ever the value changes.
     * @param eventOrValue - Event object or new value.
     * @returns Nothing.
     */
    const onChangeValue = (eventOrValue:boolean|null|SyntheticEvent):void => {
        if (!(properties.model.mutable && properties.model.writable))
            return

        let event:SyntheticEvent|undefined
        if (
            eventOrValue !== null &&
            typeof eventOrValue === 'object' &&
            (eventOrValue as SyntheticEvent).target
        ) {
            event = eventOrValue as SyntheticEvent
            properties.value = (
                typeof (event.target as {checked?:boolean|null}).checked ===
                    'undefined' &&
                typeof properties.indeterminate === 'boolean'
            ) ?
                null :
                Boolean(
                    (event.target as unknown as {checked:boolean|null}).checked
                )
        } else
            properties.value = eventOrValue as boolean|null

        setValueState((
            oldValueState:ValueState<boolean, ModelState>
        ):ValueState<boolean, ModelState> => {
            if (oldValueState.value === properties.value)
                return oldValueState

            const result:ValueState<boolean, ModelState> =
                {...oldValueState, value: properties.value as boolean|null}

            let stateChanged:boolean = determineValidationState<Properties>(
                properties, properties.model.state
            )

            if (oldValueState.model.pristine) {
                properties.dirty = true
                properties.pristine = false
                stateChanged = true
            }

            onChange(event)

            triggerCallbackIfExists<boolean>(
                properties, 'changeValue', properties.value, event
            )

            if (stateChanged) {
                result.model = properties.model.state

                triggerCallbackIfExists<boolean>(
                    properties, 'changeState', properties.model.state, event
                )
            }

            return result
        })
    }
    /**
     * Triggered on click events.
     * @param event - Mouse event object.
     * @returns Nothing.
     */
    const onClick = (event:ReactMouseEvent):void => {
        triggerCallbackIfExists<boolean>(properties, 'click', event)

        onTouch(event)
    }
    /**
     * Triggered on focus events.
     * @param event - Focus event object.
     * @returns Nothing.
     */
    const onFocus = (event:ReactFocusEvent):void => {
        triggerCallbackIfExists<boolean>(properties, 'focus', event)

        onTouch(event)
    }
    /**
     * Triggers on start interacting with the input.
     * @param event - Event object which triggered interaction.
     * @returns Nothing.
     */
    const onTouch = (event:ReactFocusEvent|ReactMouseEvent):void =>
        setValueState((
            oldValueState:ValueState<boolean, ModelState>
        ):ValueState<boolean, ModelState> => {
            let changeState:boolean = false

            if (!oldValueState.model.focused) {
                properties.focused = true
                changeState = true
            }

            if (oldValueState.model.untouched) {
                properties.touched = true
                properties.untouched = false
                changeState = true
            }

            let result:ValueState<boolean, ModelState> = oldValueState

            if (changeState) {
                result = {...oldValueState, model: properties.model.state}

                onChange(event)

                triggerCallbackIfExists<boolean>(
                    properties, 'changeState', properties.model.state, event
                )
            }

            triggerCallbackIfExists<boolean>(properties, 'touch', event)

            return result
        })
    // endregion
    // region properties
    // / region references
    const inputReference:RefObject<HTMLInputElement> =
        createRef<HTMLInputElement>()
    const foundationRef:RefObject<MDCCheckboxFoundation> =
        createRef<MDCCheckboxFoundation>()
    // / endregion
    const givenProperties:Props = {...props}
    let [showDeclaration, setShowDeclaration] = useState<boolean>(false)
    const initialValue:boolean|null =
        determineInitialValue<boolean>(props, props.checked)
    /*
        NOTE: This values have to share the same state item since they have to
        be updated in one event loop (set state callback).
    */
    const [valueState, setValueState] =
        useState<ValueState<boolean, ModelState>>({
            model: {...RequireableCheckbox.defaultModelState},
            value: initialValue
        })
    // / region derive missing properties from state variables
    if (givenProperties.showDeclaration === undefined)
        givenProperties.showDeclaration = showDeclaration

    if (!givenProperties.model)
        givenProperties.model = {}
    if (givenProperties.model.value === undefined)
        givenProperties.model.value = valueState.value
    // / endregion
    const properties:Properties = getConsolidatedProperties(givenProperties)
    useImperativeHandle(
        reference,
        ():CheckboxAdapter & {
            references:{
                foundationRef:RefObject<MDCCheckboxFoundation>
                inputReference:RefObject<HTMLInputElement>
            }
        } => ({
            properties,
            references: {foundationRef, inputReference},
            state: {
                model: properties.model.state,
                showDeclaration: properties.showDeclaration,
                value: properties.value as boolean|null
            }
        })
    )
    // endregion
    // region markup
    // TODO Helptext
    return <WrapConfigurations
        strict={RequireableCheckbox.strict}
        theme={properties.theme}
        tooltip={properties.tooltip}
    >
        <Checkbox
            checked={properties.value === null ? undefined : properties.value}
            disabled={properties.disabled}
            foundationRef={
                foundationRef as unknown as RefCallback<MDCCheckboxFoundation>
            }
            id={properties.id || properties.name}
            indeterminate={
                properties.indeterminate || properties.value === null
            }
            inputRef={
                inputReference as unknown as RefCallback<HTMLInputElement>
            }
            label={(
                properties.invalid &&
                (
                    properties.showInitialValidationState ||
                    /*
                        Material inputs show their validation state at least
                        after a blur event so we synchronize error appearances.
                    */
                    properties.visited
                )
            ) ?
                <Theme use="error">
                    {properties.description || properties.name}
                </Theme> :
                properties.description || properties.name
            }
            name={properties.name}
            onBlur={onBlur}
            onChange={onChangeValue}
            onClick={onClick}
            onFocus={onFocus}
            ripple={properties.ripple}
            value={`${properties.value}`}
        />
    </WrapConfigurations>
    // endregion
} as ForwardRefRenderFunction<CheckboxAdapter, Props>
// NOTE: This is useful in react dev tools.
RequireableCheckboxInner.displayName = 'RequireableCheckbox'
/**
 * Wrapping web component compatible react component.
 * @property static:defaultModelState - Initial model state.
 * @property static:defaultProps - Initial property configuration.
 * @property static:propTypes - Triggers reacts runtime property value checks
 * @property static:strict - Indicates whether we should wrap render output in
 * reacts strict component.
 * @property static:wrapped - Wrapped component.
 *
 * @param props - Given components properties.
 * @param reference - Reference object to forward internal state.
 * @returns React elements.
 */
export const RequireableCheckbox:StaticComponent =
    memorize(forwardRef(RequireableCheckboxInner)) as
        unknown as
        StaticComponent
// region static properties
// / region web-component hints
RequireableCheckbox.wrapped = RequireableCheckboxInner
RequireableCheckbox.webComponentAdapterWrapped = 'react'
// / endregion
RequireableCheckbox.defaultModelState = defaultModelState
RequireableCheckbox.defaultProps = defaultProperties
RequireableCheckbox.propTypes = propertyTypes
RequireableCheckbox.strict = false
// endregion
export default RequireableCheckbox
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
