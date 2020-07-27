// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module web */
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
import Tools, {globalContext, PlainObject} from 'clientnode'
// endregion
// region polyfills
// Polyfill for template strings in dynamic function constructs in simple cases
const Function:typeof Function = (
    Tools.maximalSupportedInternetExplorerVersion === 0
) ?
    globalContext.Function :
    function(...parameter:Array<any>):Function {
        let code:string = parameter[parameter.length - 1]
        if (code.startsWith('return `') && code.endsWith('`')) {
            // Handle avoidable template expression:
            // Use raw code.
            code = code.replace(/^(return )`\$\{(.+)\}`$/, '$1$2')
            // Use plain string with single quotes.
            code = code.replace(/^(return )`([^']+)`$/, "$1'$2'")
            // Use plain string with double quotes.
            code = code.replace(/^(return )`([^"]+)`$/, '$1"$2"')

            // TODO replace new lines in replaced content: ".replace(/\\n+/g, ' ')"
        }
        parameter[parameter.length - 1] = code
        return new globalContext.Function(...parameter)
    }
// endregion
/**
 * Generic web component to render a content against instance specific values.
 * @property static:defaultAttributeEvaluationTypes - Default configuration for
 * property "_attributeEvaluationTypes".
 * @property static:observedAttributes - Attribute names to observe for
 * changes.
 * @property static:useShadowDOM - Configures if a shadow dom should be used
 * during web-component instantiation.
 *
 * @property batchAttributeUpdates - Indicates whether to directly update dom
 * after each attribute mutation or to wait and batch mutations after current
 * queue has been finished.
 * @property batchedAttributeUpdates - A list of triple collecting mutations
 * on attributes.
 * @property properties - Holds currently evaluated properties.
 * @property root - Hosting dom node.
 * @property self - Back-reference to this class.
 *
 * @property _attributeEvaluationTypes - Configuration got defining how to
 * convert attributes into properties.
 * @property _attributeEvaluationTypes.any - Attribute names to evaluate.
 * @property _attributeEvaluationTypes.boolean - Attribute names to evaluate as
 * boolean.
 * @property _attributeEvaluationTypes.number - Attribute names to evaluate as
 * number.
 * @property _attributeEvaluationTypes.string - Attribute names to evaluate as
 * strings.
 * @property _attributeTyoeMappingIndex - Index to retrieve evaluation type
 * of a given property in constant time effort.
 * @property _content - Content template to render on property changes.
 */
export class Web<TElement = HTMLElement> extends HTMLElement {
    static readonly defaultAttributeEvaluationTypes:WebComponentAttributeEvaluationTypes = {
        any: [],
        boolean: [],
        number: [],
        string: []
    }
    static readonly observedAttributes:Array<string> = []
    static useShadowDOM:boolean = false

    batchAttributeUpdates:boolean = true
    batchedAttributeUpdates:Array<[string, any, any]> = []
    properties:PlainObject = {}
    root:TElement
    readonly self:typeof Web = Web

    _attributeEvaluationTypes:WebComponentAttributeEvaluationTypes =
        Web.defaultAttributeEvaluationTypes
    _attributeTypeMappingIndex:Mapping = {}
    _content:string = ''
    // region live cycle hooks
    /**
     * Initializes host dom content by attaching a shadow dom to it. Triggers
     * initial attribute changed reaction callback.
     * @returns Nothing.
     */
    constructor() {
        super()
        this.root = this.self.useShadowDOM ?
            (
                (!('attachShadow' in this) && 'ShadyDOM' in window) ?
                    window.ShadyDOM.wrap(this) :
                    this
            ).attachShadow({mode: 'open'}) :
            this
        // TODO
        console.log('A', this._attributeEvaluationTypes)
        this.generateAttributeTypeMapping()
    }
    /**
     * Triggered when ever a given attribute has changed and triggers to update
     * configured dom content.
     * @param name - Attribute name which was updates.
     * @param oldValue - Old attribute value.
     * @param newValue - New updated value.
     * @returns Nothing.
     */
    attributeChangedCallback(
        name:string, oldValue:string, newValue:string
    ):void {
        if (this.batchAttributeUpdates)
            if (this.batchedAttributeUpdates.length > 0)
                this.batchedAttributeUpdates.push([name, oldValue, newValue])
            else {
                this.batchedAttributeUpdates = [[name, oldValue, newValue]]
                Tools.timeout(():void => {
                    for (
                        const [name, oldValue, newValue] of
                            this.batchedAttributeUpdates
                    )
                        this.evaluateStringAndSetAsProperty(name, newValue)
                    this.batchedAttributeUpdates = []
                    this.render()
                })
            }
        else {
            this.evaluateStringAndSetAsProperty(name, newValue)
            this.render()
        }
    }
    // endregion
    // region getter/setter
    /**
     * Just forwards internal attribute name evaluation configuration.
     * @returns Internal attribute property value.
     */
    get attributeEvaluationTypes():WebComponentAttributeEvaluationTypes {
        return this._attributeEvaluationTypes
    }
    /**
     * Set internal attribute names as re-generates an attribute type mapping
     * index.
     * @param value - New attribute evaluation configuration.
     * @returns Nothing.
     */
    set attributeEvaluationTypes(
        value:Partial<WebComponentAttributeEvaluationTypes>
    ):void {
        this._attributeEvaluationTypes = Tools.extend(
            {}, this.self.defaultAttributeEvaluationTypes, value
        )
        this.generateAttributeTypeMapping()
        this.updateAllAttributeEvaluations()
        this.render()
    }
    /**
     * Just forwards internal content to render.
     * @returns Internal content property value.
     */
    get content():string {
        return this._content
    }
    /**
     * Sets new content to render into internal property and triggers a
     * re-rendering.
     * @param value - New content to render.
     * @returns Nothing.
     */
    set content(value:string):void {
        this._content = value
        this.render()
    }
    // endregion
    // region helper
    // TODO
    /**
     * Reflects reacts component state back to web-component's attributes and
     * properties.
     * @returns Nothing.
     */
    reflectProperties():void {
        console.log('Reflect', this.instance)
    }
    /**
     * Triggers a re-evaluation of all attributes.
     * @returns Nothing.
     */
    updateAllAttributeEvaluations():void {
        for (const name of this.self.observedAttributes)
            if (this.hasAttribute(name)) {
                const value:any = this.getAttribute(name)
                this.attributeChangedCallback(name, value, value)
            }
    }
    /**
     * Generates a mapping if attribute names and their evaluation type to
     * quickly load an attribute value into instance properties.
     * @returns Nothing.
     */
    generateAttributeTypeMapping():void {
        this._attributeTypeMappingIndex = {}
        for (const [type, names] of Object.entries(
            this._attributeEvaluationTypes
        ))
            for (const name of names)
                this._attributeTypeMappingIndex[name] = type
    }
    /**
     * Evaluates given property value depending on its type specification and
     * registers in properties mapping object.
     * @param name - Name of given value.
     * @param value - Value to evaluate.
     * @returns Nothing.
     */
    evaluateStringAndSetAsProperty(name:string, value:string):void {
        name = Tools.stringDelimitedToCamelCase(name)
        console.log(name, value, this._attributeTypeMappingIndex)
        if (Object.prototype.hasOwnProperty.call(
            this._attributeTypeMappingIndex, name
        ))
            switch (this._attributeTypeMappingIndex[name]) {
                case 'any':
                    if (value) {
                        let get:Function
                        try {
                            get = new Function(`return ${value}`)
                        } catch (error) {
                            console.warn(
                                `Error occured during compiling given "` +
                                `${name}" attribute configuration "${value}"` +
                                `: "${Tools.represent(error)}".`
                            )
                            break
                        }
                        let value:any
                        try {
                            value = get()
                        } catch (error) {
                            console.warn(
                                `Error occured durring interpreting given "` +
                                `${name}" attribute object "${value}": "` +
                                `${Tools.represent(error)}".`
                            )
                            break
                        }
                        this.properties[name] = value
                    } else
                        this.properties[name] = null
                    break
                case 'boolean':
                    this.properties[name] = value !== 'false'
                    break
                case 'number':
                    const number:number = parseFloat(value)
                    if (isNaN(number))
                        this.properties[name] = undefined
                    else
                        this.properties[name] = number
                    break
                case 'string':
                    this.properties[name] = value
                    break
            }
    }
    /**
     * Method which does the rendering job. Should be called when ever state
     * changes should be projected to the hosts dom content.
     * @returns Nothing.
     */
    render():void {
        this.root.innerHTML = (new Function(
            ...Object.keys(this), `return \`${this._content}\``
        ))(...Object.values(this))
    }
    // endregion
}
export default Web
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
