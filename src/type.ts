// -*- coding: utf-8 -*-
/** @module type */
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
import PropertyTypes, {
    any,
    arrayOf,
    boolean,
    func,
    number,
    object,
    objectOf,
    oneOfType,
    shape,
    string,
    symbol,
    ValidationMap,
    Validator
} from 'clientnode/property-types'
import {Mapping, PlainObject, RecursivePartial, ValueOf} from 'clientnode/type'
import {
    ComponentClass,
    FocusEvent,
    ForwardRefExoticComponent,
    FunctionComponent,
    FunctionComponentElement,
    KeyboardEvent,
    MouseEvent,
    MutableRefObject,
    ReactElement,
    ReactNode,
    RefAttributes,
    Requireable,
    SyntheticEvent
} from 'react'
import CodeEditorType, {IAceEditorProps as CodeEditorProps} from 'react-ace'
import {TransitionProps} from 'react-transition-group/Transition'

import {
    EditorOptions as RawTinyMCEOptions, Editor as RichTextEditor
} from 'tinymce'
import {
    ComponentAdapter,
    PropertiesValidationMap,
    StaticWebComponent as StaticBaseWebComponent,
    ValidationMapping
} from 'web-component-wrapper/type'
import {MDCMenuFoundation} from '@material/menu'
import {MDCSelectFoundation} from '@material/select'
import {MDCTextFieldFoundation} from '@material/textfield'
import {CardMediaProps} from '@rmwc/card'
import {MenuApi} from '@rmwc/menu'
import {
    FormattedOption as FormattedSelectionOption, SelectProps
} from '@rmwc/select'
import {TextFieldProps} from '@rmwc/textfield'
import {ThemeProviderProps} from '@rmwc/theme'
import {TooltipProps} from '@rmwc/tooltip'
import {IconOptions, RipplePropT} from '@rmwc/types'
import {
    Editor as RichTextEditorComponent, IAllProps as RichTextEditorProps
} from '@tinymce/tinymce-react'
// endregion
// region exports
/// region animate
export type GenericAnimateProps =
    Partial<TransitionProps<HTMLElement|undefined>>

export interface GenericAnimateComponent<Type> extends
    Omit<ForwardRefExoticComponent<GenericAnimateProps>, 'propTypes'>,
    StaticBaseWebComponent<Type>
{
    (props:(
        GenericAnimateProps & RefAttributes<HTMLDivElement|HTMLSpanElement>
    )):ReactElement
}
/// endregion
/// region generic
export interface GenericEvent<T = unknown> extends SyntheticEvent {
    detail?:T
}
export interface TestHookWrapper<
    P extends Array<unknown> = Array<unknown>,
    WP extends {children:FunctionComponentElement<{parameters:P}>} = {
        children:FunctionComponentElement<{parameters:P}>
    }
> {
    component:FunctionComponent<WP>
    properties?:WP
}
export interface TestHookResult<
    R = unknown, P extends Array<unknown> = Array<unknown>
> {
    result:{value:R}
    render:(...parameters:P) => void
}
export interface HookOptions<
    P extends Array<unknown> = Array<unknown>,
    WP extends {children:FunctionComponentElement<{parameters:P}>} = {
        children:FunctionComponentElement<{parameters:P}>
    }
> {
    parameters:P,
    wrapper?:null|TestHookWrapper<P, WP>,
    flush?:boolean
}
export interface TestEnvironment {
    container:HTMLDivElement|null
    render:<T = HTMLElement>(component:ReactElement) => null|T
    runHook:<
        R = unknown,
        P extends Array<unknown> = Array<unknown>,
        WP extends {children:FunctionComponentElement<{parameters:P}>} = {
            children:FunctionComponentElement<{parameters:P}>
        }
    >(hook:(...parameters:P) => R, options:Partial<HookOptions<P, WP>>) =>
        TestHookResult<R, P>
}
export interface CursorState {
    end:number
    start:number
}
export type Renderable = Array<ReactElement|string>|ReactElement|string
//// region model
export interface CommonBaseModel {
    declaration:string
    default:unknown
    description:string
    emptyEqualsNull:boolean
    maximum:number|string
    maximumLength:number
    minimum:number|string
    minimumLength:number
    name:string
    selection?:SelectProps['options']
    trim:boolean
    type:string
    value?:unknown
}
export interface ModelState {
    dirty:boolean
    focused:boolean
    invalid:boolean
    invalidRequired:boolean
    pristine:boolean
    touched:boolean
    untouched:boolean
    valid:boolean
    visited:boolean
}
export interface BaseModel extends CommonBaseModel {
    invertedRegularExpressionPattern:Array<RegExp|string>|null|RegExp|string
    mutable:boolean
    nullable:boolean
    regularExpressionPattern:Array<RegExp|string>|null|RegExp|string
    state:ModelState
    writable:boolean
}
export interface CommonModel<T = unknown> extends CommonBaseModel {
    default:null|T
    value?:null|T
}
export interface Model<T = unknown> extends BaseModel {
    default:null|T
    value?:null|T
}
//// endregion
export interface BaseProperties extends CommonBaseModel, ModelState {
    className:string
    disabled:boolean
    enforceUncontrolled:boolean
    id:string
    initialValue:unknown
    label:string
    model:BaseModel
    name:string
    required:boolean
    requiredText:string
    ripple:RipplePropT
    rootProps:Mapping<boolean|number|string>
    showDeclaration:boolean
    showInitialValidationState:boolean
    showValidationState:boolean
    // NOTE: We want to avoid a collision with html's native "style" property.
    styles:Mapping
    themeConfiguration:ThemeProviderProps['options']
    tooltip:string|TooltipProps
}
export type BaseProps =
    Partial<Omit<BaseProperties, 'model'>> & {model?:Partial<BaseModel>}

export type DefaultBaseProperties =
    Omit<BaseProps, 'model'> & {model:BaseModel}

export interface TypedProperties<T = unknown> extends BaseProperties {
    initialValue:null|T
    model:Model<T>
    onBlur:(event:GenericEvent|undefined, properties:this) => void
    onChange:(properties:this, event?:GenericEvent) => void
    onChangeShowDeclaration:(
        show:boolean, event:GenericEvent|undefined, properties:this
    ) => void
    onChangeState:(
        state:ModelState, event:GenericEvent|undefined, properties:this
    ) => void
    onChangeValue:(
        value:null|T, event:GenericEvent|undefined, properties:this
    ) => void
    onClick:(event:MouseEvent, properties:this) => void
    onFocus:(event:FocusEvent, properties:this) => void
    onTouch:(event:GenericEvent, properties:this) => void
}
export type Properties<T = unknown> = TypedProperties<T> & CommonModel<T>
export type Props<T = unknown> =
    Partial<Omit<Properties<T>, 'model'>> & {model?:Partial<Model<T>>}

export type DefaultProperties<T = unknown> =
    Omit<Props<T>, 'model'> & {model:Model<T>}
//// region state
export interface State<T = unknown> {
    modelState?:ModelState
    value?:null|T
}
export interface ValueState<T = unknown, MS = ModelState> {
    modelState:MS
    value:null|T
}
export interface EditorState {
    editorIsActive:boolean
    selectionIsUnstable:boolean
}
//// endregion
export interface StaticWebComponent<
    Type, MS = ModelState, DP = DefaultProperties
> extends StaticBaseWebComponent<Type> {
    defaultModelState:MS
    defaultProperties:DP
    strict:boolean
}

export type StaticComponent<
    Type, P = Props, MS = ModelState, DP = DefaultProperties
> = Omit<ComponentClass<P>, 'propTypes'> & StaticWebComponent<Type, MS, DP>
export type StaticFunctionComponent<
    Type, P = Props, MS = ModelState, DP = DefaultProperties
> = Omit<FunctionComponent<P>, 'propTypes'> & StaticComponent<Type, P, MS, DP>

export interface InputComponent<
    Type,
    P = Props,
    MS = ModelState,
    DP = DefaultProperties,
    A = ComponentAdapter<P>
> extends
    Omit<ForwardRefExoticComponent<P>, 'propTypes'>,
    StaticWebComponent<Type, MS, DP>
{
    (props:P & RefAttributes<A>):ReactElement
}
//// region constants
export const baseModelPropertyTypes:ValidationMapping = {
    declaration: string,
    default: any,
    description: string,
    name: string,
    selection: oneOfType([
        arrayOf(oneOfType([
            arrayOf(oneOfType([number, string])),
            number,
            objectOf(oneOfType([number, string])),
            string
        ])),
        objectOf(oneOfType([number, string]))
    ]),
    /*
        NOTE: Also not yet working:
        type: oneOf([
            'color',
            'date',
            'datetime-local',
            'email',
            'month',
            'number',
            'password',
            'range',
            'search',
            'text',
            'time',
            'time-local',
            'url',
            'week'
        ])
    */
    type: string,
    value: any
} as const
export const modelStatePropertyTypes:{
    [key in keyof ModelState]:Requireable<boolean|symbol>
} = {
    dirty: oneOfType([boolean, symbol]),
    pristine: oneOfType([boolean, symbol]),
    touched: oneOfType([boolean, symbol]),
    untouched: oneOfType([boolean, symbol]),

    focused: oneOfType([boolean, symbol]),
    visited: oneOfType([boolean, symbol]),

    invalid: oneOfType([boolean, symbol]),
    invalidRequired: oneOfType([boolean, symbol]),
    valid: oneOfType([boolean, symbol])
} as const
export const modelPropertyTypes:ValidationMapping = {
    ...baseModelPropertyTypes,

    emptyEqualsNull: boolean,
    trim: boolean,

    invertedRegularExpressionPattern:
        oneOfType([arrayOf(oneOfType([object, string])), object, string]),
    regularExpressionPattern:
        oneOfType([arrayOf(oneOfType([object, string])), object, string]),

    maximum: oneOfType([number, string]),
    minimum: oneOfType([number, string]),

    maximumLength: number,
    minimumLength: number,

    mutable: boolean,
    writable: boolean,

    state: shape(modelStatePropertyTypes)
} as const
export const propertyTypes:ValidationMapping = {
    ...baseModelPropertyTypes,
    ...modelStatePropertyTypes,
    className: string,
    disabled: boolean,
    enforceUncontrolled: boolean,
    initialValue: any,
    inputProperties: object,
    model: shape<ValidationMap<ValueOf<typeof PropertyTypes>>>(
        modelPropertyTypes
    ),
    onChange: func,
    onChangeValue: func,
    onChangeShowDeclaration: func,
    onChangeState: func,
    onClick: func,
    onFocus: func,
    onTouch: func,
    required: boolean,
    requiredText: string,
    ripple: oneOfType([boolean, object]),
    rootProps: object,
    showDeclaration: oneOfType([boolean, symbol]),
    showInitialValidationState: boolean,
    showValidationState: boolean,
    styles: object,
    themeConfiguration: object,
    /*
        NOTE: Not yet working:
        tooltip?:string|TooltipProps
        trailingIcon?:string|(IconOptions & {tooltip?:string|TooltipProps})
    */
    tooltip: any
}
export const defaultModelState:ModelState = {
    dirty: false,
    focused: false,
    invalid: false,
    invalidRequired: false,
    pristine: true,
    touched: false,
    untouched: true,
    valid: true,
    visited: false
} as const
export const defaultModel:Model<string> = {
    declaration: '',
    default: null,
    description: '',
    emptyEqualsNull: true,
    invertedRegularExpressionPattern: null,
    maximum: Infinity,
    maximumLength: -1,
    minimum: -Infinity,
    minimumLength: 0,
    mutable: true,
    name: 'NO_NAME_DEFINED',
    nullable: true,
    regularExpressionPattern: null,
    state: {...defaultModelState},
    trim: true,
    type: 'string',
    /*
        NOTE: We do not want to shadow "default" here:
        value: null,
    */
    writable: true
} as const
/*
    NOTE: Avoid setting any properties already defined in model here since they
    would permanently shadow them.
*/
export const defaultProperties:DefaultProperties<string> = {
    enforceUncontrolled: false,
    model: {...defaultModel},
    showDeclaration: undefined,
    showInitialValidationState: false,
    showValidationState: true,
    requiredText: 'Please fill this field.'
} as const
//// endregion
/// endregion
/// region checkbox
export interface CheckboxProperties extends Properties<boolean> {
    checked:boolean
    id:string
}
export type CheckboxModel = Model<boolean>
export type CheckboxModelState = ModelState
export type CheckboxValueState = ValueState<boolean, CheckboxModelState>
export type CheckboxProps =
    Partial<Omit<CheckboxProperties, 'model'>> &
    {model?:Partial<CheckboxModel>}
export type DefaultCheckboxProperties =
    Omit<CheckboxProps, 'model'> & {model:CheckboxModel}
export type CheckboxState = State<boolean>
export type CheckboxAdapter =
    ComponentAdapter<CheckboxProperties, Omit<CheckboxState, 'value'>>

export type CheckboxComponent<Type> = InputComponent<
    Type,
    CheckboxProps,
    CheckboxModelState,
    DefaultCheckboxProperties,
    CheckboxAdapter
>
//// region constants
export const checkboxPropertyTypes:PropertiesValidationMap = {
    ...propertyTypes,
    ...modelStatePropertyTypes,
    checked: boolean,
    id: string
} as const
export const defaultCheckboxModel:CheckboxModel = {
    ...defaultModel as unknown as CheckboxModel,
    default: false,
    type: 'boolean',
    value: false
} as const
/*
    NOTE: Avoid setting any properties already defined in model here since they
    would permanently shadow them.
*/
export const defaultCheckboxProperties:DefaultCheckboxProperties = {
    ...defaultProperties as CheckboxProps,
    default: false,
    model: {...defaultCheckboxModel},
    requiredText: 'Please check this field.'
} as const
//// endregion
/// endregion
/// region input
//// region data transformation
export type Transformer<T = unknown> = (
    value:T,
    configuration:DefaultInputProperties<T>,
    transformer:InputDataTransformation
) => string
export interface FormatSpecification<T = unknown> {
    options?:PlainObject
    transform?:Transformer<T>
}
export interface FormatSpecifications<T = unknown> {
    final:FormatSpecification<T>
    intermediate?:FormatSpecification<T>
}
export interface DataTransformSpecification<
    T = unknown, InputType = number|string
> {
    format?:FormatSpecifications<T>
    parse?:(
        value:InputType,
        configuration:DefaultInputProperties<T>,
        transformer:InputDataTransformation
    ) => T
    type?:NativeInputType
}
export type InputDataTransformation =
    {
        boolean:DataTransformSpecification<boolean, number|string>

        currency:DataTransformSpecification<number, string>

        date:DataTransformSpecification<number, Date|number|string>
        'datetime-local':DataTransformSpecification<number, Date|number|string>
        time:DataTransformSpecification<number, Date|number|string>
        'time-local':DataTransformSpecification<number, Date|number|string>

        float:DataTransformSpecification<number, string>
        integer:DataTransformSpecification<number, string>
        number:DataTransformSpecification<number, number>

        string?:DataTransformSpecification<unknown>
    } &
    {[key in Exclude<
        NativeInputType, 'date'|'datetime-local'|'time'|'number'
    >]?:DataTransformSpecification<unknown>}
//// endregion
export type NormalizedSelection =
    Array<Omit<FormattedSelectionOption, 'value'> & {value:unknown}>
export interface InputTablePosition {
    column:number
    row:number
}
export interface InputModelState extends ModelState {
    invalidMaximum:boolean
    invalidMinimum:boolean

    invalidMaximumLength:boolean
    invalidMinimumLength:boolean

    invalidInvertedPattern:boolean
    invalidPattern:boolean
}
export interface InputModel<T = unknown> extends Model<T> {
    state:InputModelState
}
export interface InputValueState<T = unknown, MS = ModelState> extends
    ValueState<T, MS>
{
    representation?:ReactNode|string
}
export type NativeInputType = (
    'date' |
    'datetime-local' |
    'month' |
    'number' |
    'range' |
    'text' |
    'time' |
    'week'
)
export type GenericInputType = (
    'boolean' |
    'currency' |
    'float' |
    'integer' |
    'string' |
    'time-local' |
    NativeInputType
)
export interface InputChildrenOptions<P, T> {
    index:number
    normalizedSelection:NormalizedSelection
    properties:P
    query:string
    suggestion:ReactNode|string
    value:T
}
export interface SuggestionCreatorOptions<P> {
    abortController:AbortController
    properties:P
    query:string
}
export interface InputProperties<T = unknown> extends
    InputModelState, Properties<T>
{
    align:'end'|'start'
    children:(options:InputChildrenOptions<this, T>) => null|ReactElement
    cursor:CursorState
    /*
        plain -> input field
        text -> textarea
        richtext(raw) -> texteditor without formatting
        richtext(simple) -> texteditor with semantic text modifications
        richtext(normal) -> texteditor with additional text formatting
        richtext(advanced) -> texteditor with advanced text formatting
     */
    editor:(
        'code' |
        'code(css)' |
        'code(script)' |
        'plain' |
        'text' |
        'richtext(raw)' |
        'richtext(simple)' |
        'richtext(normal)' |
        'richtext(advanced)'
    )
    editorIsActive:boolean
    hidden:boolean
    icon:string|(IconOptions & {tooltip?:string|TooltipProps})
    inputProperties:Partial<
        CodeEditorProps|RichTextEditorProps|SelectProps|TextFieldProps
    >
    inputProps:Mapping<boolean|number|string>
    invertedPattern:Array<RegExp|string>|null|RegExp|string
    invertedPatternText:string
    labels:Array<[string, string]>|Array<string>|Mapping
    maximumLengthText:string
    maximumText:string
    minimumLengthText:string
    minimumText:string
    model:InputModel<T>
    onChangeEditorIsActive:(
        isActive:boolean, event:MouseEvent|undefined, properties:this
    ) => void
    onKeyDown:(event:KeyboardEvent, properties:this) => void
    onKeyUp:(event:KeyboardEvent, properties:this) => void
    onSelect:(event:GenericEvent, properties:this) => void
    onSelectionChange:(event:GenericEvent, properties:this) => void
    outlined:boolean
    pattern:Array<RegExp|string>|null|RegExp|string
    patternText:string
    placeholder:string
    representation:ReactNode|string
    rows:number
    searchSelection:boolean
    selectableEditor:boolean
    step:number
    suggestionCreator?:(options:SuggestionCreatorOptions<this>) =>
        InputProperties['selection']|Promise<InputProperties['selection']>
    suggestSelection:boolean
    trailingIcon:string|(IconOptions & {tooltip?:string|TooltipProps})
    transformer:RecursivePartial<DataTransformSpecification<
        T, Date|number|string
    >>
}
export type InputProps<T = unknown> =
    Partial<Omit<InputProperties<T>, 'model'>> &
    {model?:Partial<InputModel<T>>}

export type DefaultInputProperties<T = string> =
    Omit<InputProps<T>, 'model'> & {model:InputModel<T>}

export type InputPropertyTypes<T = unknown> = {
    [key in keyof InputProperties<T>]:ValueOf<typeof PropertyTypes>
}

export interface InputState<T = unknown> extends State<T> {
    cursor:CursorState
    editorIsActive:boolean
    hidden?:boolean
    modelState:InputModelState
    representation?:ReactNode|string
    selectionIsUnstable:boolean
    showDeclaration:boolean
}

// NOTE: We hold "selectionIsUnstable" state value as internal private one.
export type InputAdapter<T = unknown> = ComponentAdapter<
    InputProperties<T>,
    Omit<InputState<T>, 'representation'|'selectionIsUnstable'|'value'> &
    {
        representation?:ReactNode|string
        value?:null|T
    }
>
export interface InputAdapterWithReferences<T = unknown> extends
    InputAdapter<T>
{
    references:{
        codeEditorReference:MutableRefObject<CodeEditorType|null>
        codeEditorInputReference:MutableRefObject<HTMLTextAreaElement|null>
        foundationReference:MutableRefObject<
            MDCSelectFoundation|MDCTextFieldFoundation|null
        >
        inputReference:MutableRefObject<
            HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|null
        >
        richTextEditorInputReference:MutableRefObject<HTMLTextAreaElement|null>
        richTextEditorInstance:MutableRefObject<RichTextEditor|null>
        richTextEditorReference:MutableRefObject<RichTextEditorComponent|null>
        suggestionMenuAPIReference:MutableRefObject<MenuApi|null>
        suggestionMenuFoundationReference:MutableRefObject<
            MDCMenuFoundation|null
        >
        wrapperReference:MutableRefObject<HTMLDivElement|null>
    }
}

export interface TinyMCEOptions extends RawTinyMCEOptions {
    selector?:undefined
    target?:undefined
}

export interface GenericInputComponent<Type> extends
    Omit<ForwardRefExoticComponent<InputProps>, 'propTypes'>,
    StaticWebComponent<Type, InputModelState, DefaultInputProperties>
{
    <T = string>(
        props:InputProps<T> & RefAttributes<InputAdapter<T>>
    ):ReactElement

    locales:Array<string>
    transformer:InputDataTransformation
}
//// region constants
export const inputModelStatePropertyTypes:{
    [key in keyof InputModelState]:Requireable<boolean|symbol>
} = {
    ...modelStatePropertyTypes,

    invalidMaximum: oneOfType([boolean, symbol]),
    invalidMinimum: oneOfType([boolean, symbol]),

    invalidMaximumLength: oneOfType([boolean, symbol]),
    invalidMinimumLength: oneOfType([boolean, symbol]),

    invalidInvertedPattern: oneOfType([boolean, symbol]),
    invalidPattern: oneOfType([boolean, symbol])
} as const
export const inputPropertyTypes:PropertiesValidationMap = {
    ...propertyTypes,
    ...inputModelStatePropertyTypes,
    /*
        NOTE: Not yet working:
        align: oneOf(['end', 'start']),
    */
    align: string,
    children: func,
    cursor: oneOfType([
        shape({
            end: number.isRequired,
            start: number.isRequired
        }),
        symbol
    ]),
    /*
        NOTE: Not yet working:
        editor: oneOf([
            'code',
            'code(css)',
            'code(script)',
            'plain',
            'text',
            'richtext(raw)',
            'richtext(simple)',
            'richtext(normal)',
            'richtext(advanced)'
        ]),
    */
    editor: string,
    editorIsActive: oneOfType([boolean, symbol]),
    hidden: oneOfType([boolean, symbol]),
    /*
        NOTE: Not yet working:
        icon?:string|(IconOptions & {tooltip?:string|TooltipProps})
    */
    icon: oneOfType([string, object]),
    inputProps: object,
    invertedPattern: oneOfType(
        [arrayOf(oneOfType([object, string])), object, string]
    ),
    invertedPatternText: string,
    labels: oneOfType([arrayOf(arrayOf(string)), arrayOf(string), object]),
    maximum: oneOfType([number, string]),
    maximumLengthText: string,
    maximumText: string,
    minimum: oneOfType([number, string]),
    minimumLengthText: string,
    minimumText: string,
    onBlur: func,
    onChangeEditorIsActive: func,
    onKeyDown: func,
    onKeyUp: func,
    onSelect: func,
    onSelectionChange: func,
    outlined: boolean,
    pattern: oneOfType([arrayOf(oneOfType([object, string])), object, string]),
    patternText: string,
    placeholder: string,
    representation: oneOfType([string, symbol]),
    rows: number,
    searchSelection: boolean,
    selectableEditor: boolean,
    step: number,
    suggestionCreator: func,
    suggestSelection: boolean,
    trailingIcon: any,
    transformer: object
} as const
export const inputRenderProperties:Array<string> =
    ['children', 'suggestionCreator']
export const defaultInputModelState:InputModelState = {
    ...defaultModelState,

    invalidMaximum: false,
    invalidMinimum: false,

    invalidMaximumLength: false,
    invalidMinimumLength: false,

    invalidInvertedPattern: false,
    invalidPattern: false
} as const
export const defaultInputModel:InputModel<string> = {
    ...defaultModel as InputModel<string>,
    state: defaultInputModelState
} as const
/*
    NOTE: Avoid setting any properties already defined in model here since they
    would permanently shadow them.
*/
export const defaultInputProperties:DefaultInputProperties = {
    ...defaultProperties as DefaultInputProperties,
    cursor: {
        end: 0,
        start: 0
    },
    editor: 'plain',
    invertedPatternText:
        'Your string should not match the regular expression' +
        '${[].concat(invertedPattern).length > 1 ? "s" : ""}: ' +
        '"${[].concat(invertedPattern).join("\\", \\"")}".',
    maximumLengthText:
        'Please type less or equal than ${maximumLength} symbols.',
    maximumText: 'Please type less or equal than ${formatValue(maximum)}.',
    minimumLengthText:
        'Please type at least or equal ${minimumLength} symbols.',
    minimumText: 'Please type at least or equal ${formatValue(minimum)}.',
    model: {...defaultInputModel},
    patternText:
        'Your string have to match the regular expression' +
        '${[].concat(pattern).length > 1 ? "s" : ""}: ' +
        '"${[].concat(pattern).join("\\", \\"")}".',
    rows: 4,
    searchSelection: false,
    selectableEditor: false,
    step: 1,
    suggestSelection: false
} as const
//// endregion
/// endregion
/// region file-input
export type FileRepresentationType =
    'binary'|'image'|'renderableText'|'text'|'video'
export interface FileValue {
    blob?:Partial<Blob>|null
    hash?:null|string
    name?:null|string
    source?:null|string
    url?:null|string
}
export interface FileInputValueState extends
    ValueState<FileValue, FileInputModelState>
{
    attachBlobProperty:boolean
}

export interface FileInputModelState extends ModelState {
    invalidMaximumSize:boolean
    invalidMinimumSize:boolean

    invalidContentTypePattern:boolean

    invalidName:boolean
}
export interface FileInputModel extends Model<FileValue> {
    contentTypeRegularExpressionPattern:Array<RegExp|string>|null|RegExp|string
    invertedContentTypeRegularExpressionPattern:(
        Array<RegExp|string>|null|RegExp|string
    )

    maximumSize:number
    minimumSize:number

    fileName:InputModel<string>

    state:FileInputModelState
}

export interface FileInputChildrenOptions<P> {
    declaration:string
    invalid:boolean
    properties:P
    value?:FileValue|null
}
export interface FileInputProperties extends
    Properties<FileValue>, FileInputModelState
{
    children:(options:FileInputChildrenOptions<this>) => null|ReactElement

    contentTypePattern:Array<RegExp|string>|null|RegExp|string
    invertedContentTypePattern:Array<RegExp|string>|null|RegExp|string

    contentTypePatternText:string
    invertedContentTypePatternText:string
    maximumSizeText:string
    minimumSizeText:string

    deleteButton:ReactElement|string
    downloadButton:ReactElement|string
    editButton:ReactElement|string
    newButton:ReactElement|string

    encoding:string

    generateFileNameInputProperties:(
        prototype:InputProps<string>,
        properties:this & {value:FileValue & {name:string}}
    ) => InputProps<string>

    media:CardMediaProps

    model:FileInputModel

    outlined:boolean

    sourceToBlobOptions:{
        endings?:'native'|'transparent'
        type?:string
    }
}
export type FileInputProps =
    Partial<Omit<FileInputProperties, 'model'>> &
    {model?:Partial<FileInputModel>}

export type DefaultFileInputProperties =
    Omit<FileInputProps, 'model'> & {model:FileInputModel}

export type FileInputPropertyTypes = {
    [key in keyof FileInputProperties]:ValueOf<typeof PropertyTypes>
}

export interface FileInputState extends State<FileValue> {
    modelState:FileInputModelState
}

export type FileInputAdapter = ComponentAdapter<
    FileInputProperties, Omit<FileInputState, 'value'> &
    {value?:FileValue|null}
>
export interface FileInputAdapterWithReferences extends FileInputAdapter {
    references:{
        deleteButtonReference:MutableRefObject<HTMLButtonElement|null>
        downloadLinkReference:MutableRefObject<HTMLAnchorElement|null>
        fileInputReference:MutableRefObject<HTMLInputElement|null>
        nameInputReference:MutableRefObject<InputAdapter<string>|null>
        uploadButtonReference:MutableRefObject<HTMLButtonElement|null>
    }
}

export type FileInputComponent<Type> = InputComponent<
    Type,
    FileInputProps,
    FileInputModelState,
    DefaultFileInputProperties,
    FileInputAdapter
>
//// region constants
export const fileInputModelStatePropertyTypes:{
    [key in keyof FileInputModelState]:Requireable<boolean|symbol>
} = {
    ...modelStatePropertyTypes,

    invalidContentTypePattern: oneOfType([boolean, symbol]),

    invalidMaximumSize: oneOfType([boolean, symbol]),
    invalidMinimumSize: oneOfType([boolean, symbol]),

    invalidName: oneOfType([boolean, symbol])
} as const
export const fileInputPropertyTypes:PropertiesValidationMap = {
    ...propertyTypes,
    ...fileInputModelStatePropertyTypes,

    children: func,

    contentTypePatternText:
        oneOfType([arrayOf(oneOfType([object, string])), object, string]),
    invertedContentTypePatternText:
        oneOfType([arrayOf(oneOfType([object, string])), object, string]),

    deleteButton: oneOfType([object, string]),
    downloadButton: oneOfType([object, string]),
    editButton: oneOfType([object, string]),
    newButton: oneOfType([object, string]),

    encoding: string,

    generateFileNameInputProperties: func,

    maximumSizeText: string,
    minimumSizeText: string,

    onBlur: func,

    outlined: boolean
} as const
export const defaultFileInputModelState:FileInputModelState = {
    ...defaultModelState,
    invalidContentTypePattern: false,

    invalidMaximumSize: false,
    invalidMinimumSize: false,

    invalidName: false
} as const
export const defaultFileInputModel:FileInputModel = {
    ...defaultModel as Model<FileValue>,

    contentTypeRegularExpressionPattern: /^.+\/.+$/,
    invertedContentTypeRegularExpressionPattern: null,

    fileName: {
        ...defaultInputModel,
        maximumLength: 1024,
        name: 'Name',
        regularExpressionPattern: /^[^/]+$/
    },

    maximumSize: Infinity,
    minimumSize: 0,

    state: defaultFileInputModelState
} as const
/*
    NOTE: Avoid setting any properties already defined in model here since they
    would permanently shadow them.
*/
export const defaultFileNameInputProperties:InputProps<string> = {
    ...defaultInputProperties,

    emptyEqualsNull: false,

    invertedPatternText:
        'Your file\'s name should not match the regular expression' +
        '${[].concat(invertedPattern).length > 1 ? "s" : ""}: "' +
        '"${[].concat(invertedPattern).join("\\", \\"")}".',
    patternText:
        'Your file\'s name has to match the regular expression' +
        '${[].concat(pattern).length > 1 ? "s" : ""}: "' +
        '"${[].concat(pattern).join("\\", \\"")}".',

    required: true
} as const
delete (defaultFileNameInputProperties as {model?:InputModel}).model
export const defaultFileInputProperties:DefaultFileInputProperties = {
    ...defaultProperties as unknown as Partial<DefaultFileInputProperties>,

    contentTypePatternText:
        'Your file\'s mime-type has to match the regular expression' +
        '${[].concat(contentTypePattern).length > 1 ? "s" : ""}: "' +
        '"${[].concat(contentTypePattern).join("\\", \\"")}".',
    invertedContentTypePatternText:
        'Your file\'s mime-type should not match the regular expression' +
        '${[].concat(invertedContentTypePattern).length > 1 ? "s" : ""}: "' +
        '"${[].concat(invertedContentTypePattern).join("\\", \\"")}".',

    deleteButton: 'delete',
    downloadButton: 'download',
    editButton: 'edit',
    newButton: 'new',

    encoding: 'utf-8',

    generateFileNameInputProperties: Tools.identity,

    maximumSizeText:
        'Please provide a file with less or equal size than ${maximumSize} ' +
        'byte.',
    minimumSizeText:
        'Please provide a file with more or equal size than ${maximumSize} ' +
        'byte.',

    media: {
        sixteenByNine: true
    },

    model: {...defaultFileInputModel},

    sourceToBlobOptions: {endings: 'transparent', type: 'text/plain'}
} as const
//// endregion
/// endregion
/// region inputs
export interface InputsPropertiesItem<T, TS = unknown> {
    model?:{
        state?:TS
        value?:null|T
    }
    value?:null|T
}
export interface InputsCreateOptions<T, IP> {
    index:number
    properties:IP
    values:Array<null|T|undefined>|null
}
export interface InputsCreateItemOptions<
    T, P extends InputsPropertiesItem<T>, IP
> extends InputsCreateOptions<T, IP> {
    item:Partial<P>
}
export interface InputsCreatePrototypeOptions<
    T, P extends InputsPropertiesItem<T>, IP
> extends InputsCreateItemOptions<T, P, IP> {
    lastValue:null|T|undefined
}

export interface InputsModelState extends ModelState {
    invalidMaximumNumber:boolean
    invalidMinimumNumber:boolean
}
export interface InputsModel<T, P extends InputsPropertiesItem<T>> extends
    Model<Array<P>>
{
    maximumNumber:number
    minimumNumber:number

    state:InputsModelState

    writable:boolean
}

export interface InputsChildrenOptions<
    T, P extends InputsPropertiesItem<T>, IP
> {
    index:number
    inputsProperties:IP
    properties:Partial<P>
}
export interface InputsProperties<
    T = unknown, P extends InputsPropertiesItem<T> = Properties<T>
> extends InputsModelState, Omit<Properties<Array<P>>, 'onChangeValue'> {
    addIcon:IconOptions
    removeIcon:IconOptions

    children:(options:InputsChildrenOptions<T, P, this>) => ReactElement

    createItem:(options:InputsCreateItemOptions<T, P, this>) => P
    createPrototype:(options:InputsCreatePrototypeOptions<T, P, this>) => P

    maximumNumber:number
    minimumNumber:number

    model:InputsModel<T, P>

    onChangeValue:(
        values:Array<null|T>|null, event:GenericEvent|unknown, properties:this
    ) => void

    value:Array<P>|null

    writable:boolean
}
export type InputsProps<
    T = unknown, P extends InputsPropertiesItem<T> = Properties<T>
> =
    Partial<Omit<InputsProperties<T, P>, 'model'|'value'>> &
    {
        model?:Partial<InputsModel<T, P>>
        value?:Array<Partial<P>>|Array<null|T|undefined>|null
    }

export type DefaultInputsProperties<
    T = string, P extends InputsPropertiesItem<T> = InputProps<T>
> =
    Partial<Omit<InputsProperties<T, P>, 'default'|'model'|'value'>> &
    {model:InputsModel<T, P>}

export type InputsPropertyTypes<
    T = unknown, P extends InputsPropertiesItem<T> = Properties<T>
> = {
    [key in keyof InputsProperties<P>]:ValueOf<typeof PropertyTypes>
}

export type InputsState<T = unknown> = State<Array<null|T|undefined>>

export type InputsAdapter<
    T = unknown, P extends InputsPropertiesItem<T> = Properties<T>
> = ComponentAdapter<InputsProperties<T, P>, InputsState<T>>
export type InputsAdapterWithReferences<
    T = unknown,
    P extends InputsPropertiesItem<T> = Properties<T>,
    RefType = unknown
> = InputsAdapter<T, P> & {references:Array<MutableRefObject<RefType>>}

export interface InputsComponent<Type> extends
    Omit<ForwardRefExoticComponent<InputsProps>, 'propTypes'>,
    StaticWebComponent<Type, InputsModelState, DefaultInputsProperties>
{
    <T = string, P extends InputsPropertiesItem<T> = InputProperties<T>>(
        props:InputsProps<T, P> & RefAttributes<InputsAdapter<T, P>>
    ):ReactElement
}
//// region constants
export const inputsPropertyTypes:PropertiesValidationMap = {
    ...propertyTypes,
    ...inputModelStatePropertyTypes,
    // We use that function (render prop) to produce input component instances.
    children: func,

    createItem: func,
    createPrototype: func,

    maximumNumber: number,
    minimumNumber: number
} as const
export const inputsRenderProperties:Array<string> =
    ['children', 'createItem', 'createPrototype']
export const defaultInputsModel:InputsModel<string, InputProperties<string>> = {
    ...defaultModel as InputsModel<string, InputProperties<string>>,

    state: {
        ...defaultModel.state,

        invalidMaximumNumber: false,
        invalidMinimumNumber: false
    },

    maximumNumber: Infinity,
    minimumNumber: 0,

    type: 'string[]'
} as const
/*
    NOTE: Avoid setting any properties already defined in model here since they
    would permanently shadow them.
*/
export const defaultInputsProperties:DefaultInputsProperties = {
    ...defaultProperties as DefaultInputsProperties,

    addIcon: {icon: 'add'},
    removeIcon: {icon: 'clear'},

    createItem: ({item}):InputProps<string> => item,
    createPrototype: ({item}):InputProps<string> => item,

    model: {...defaultInputsModel}
} as const
//// endregion
/// endregion
/// region interval
export interface IntervalValue {
    end?:null|number
    start?:null|number
}

export interface IntervalConfiguration {
    end:InputProps<number>
    start:InputProps<number>
}

export type IntervalModelState = ModelState
export interface IntervalModel {
    name:string
    state:IntervalModelState
    value:{
        end:InputModel<number>
        start:InputModel<number>
    }
}

export interface IntervalProperties extends Omit<
    InputProperties<number>,
    'icon'|'model'|'onChange'|'onChangeValue'|'value'
> {
    icon:IconOptions

    model:IntervalModel

    onChange:(properties:this, event?:GenericEvent) => void
    onChangeValue:(value:null|IntervalValue, event?:GenericEvent) => void

    value:IntervalConfiguration
}
export type IntervalProps =
    Omit<
        InputProps<number>, 'icon'|'model'|'onChange'|'onChangeValue'|'value'
    > &
    Partial<{
        end:InputProps<number>
        start:InputProps<number>

        icon:IntervalProperties['icon']

        model:IntervalProperties['model']

        onChange:IntervalProperties['onChange']
        onChangeValue:IntervalProperties['onChangeValue']

        value:IntervalConfiguration|IntervalValue|null
    }>

export type DefaultIntervalProperties =
    Omit<IntervalProps, 'model'> & {model:IntervalModel}

export type IntervalPropertyTypes = {
    [key in keyof IntervalProperties]:ValueOf<typeof PropertyTypes>
}

export type IntervalAdapter =
    ComponentAdapter<IntervalProperties, {value?:IntervalValue|null}>
export interface IntervalAdapterWithReferences extends IntervalAdapter {
    references:{
        end:MutableRefObject<InputAdapterWithReferences<number>|null>
        start:MutableRefObject<InputAdapterWithReferences<number>|null>
    }
}

export type IntervalComponent<Type> = InputComponent<
    Type,
    IntervalProps,
    IntervalModelState,
    DefaultIntervalProperties,
    IntervalAdapter
>
//// region constants
export const intervalPropertyTypes:PropertiesValidationMap = {
    ...inputPropertyTypes as Mapping<ValueOf<PropertiesValidationMap>>,
    value: shape<ValidationMap<{
        end:unknown
        start:unknown
    }>>({
        end: oneOfType<Validator<unknown>>([
            number,
            shape<ValidationMap<ValueOf<typeof PropertyTypes>>>(
                inputPropertyTypes
            )
        ]),
        start: oneOfType<Validator<unknown>>([
            number,
            shape<ValidationMap<ValueOf<typeof PropertyTypes>>>(
                inputPropertyTypes
            )
        ])
    })
} as const
export const defaultIntervalProperties:DefaultIntervalProperties = {
    icon: {icon: 'timelapse'},

    maximumText:
        'Please provide somthing earlier than ${formatValue(maximum)}.',
    minimumText: 'Please provide somthing later than ${formatValue(minimum)}.',
    requiredText: 'Please provide a range.',

    model: {
        name: 'NO_NAME_DEFINED',
        state: {...defaultModelState},
        value: {
            end: {
                ...defaultInputModel as unknown as InputModel<number>,
                description: 'End',
                name: 'end'
            },
            start: {
                ...defaultInputModel as unknown as InputModel<number>,
                description: 'Start',
                name: 'start'
            }
        }
    },

    type: 'time'
} as const
//// endregion
/// endregion
export interface ConfigurationProperties {
    strict?:boolean
    themeConfiguration?:ThemeProviderProps['options']
    tooltip?:Properties['tooltip']
    wrap?:boolean
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
