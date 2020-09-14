// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module react-input-material */
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
import React, {FunctionComponent, useState} from 'react'
import ReactDOM from 'react-dom'

import GenericInput from './components/GenericInput'
// endregion
const Application:FunctionComponent<{}> = () => {
    const [selectedState, setSelectedState] = useState()
    const onChange = (state) => setSelectedState(state)

    return (<>
        <div className="inputs">

            <GenericInput onChange={onChange}/>

            <hr/>

            <GenericInput name="input1" onChange={onChange}/>
            <GenericInput model={{name: 'input1Model'}} onChange={onChange}/>

            <hr/>

            <GenericInput name="input2" onChange={onChange}/>
            <GenericInput
                initialValue="value2Model"
                model={{name: 'input2Model'}}
                onChange={onChange}
            />
            <hr/>

            <GenericInput
                declaration="Disabled"
                disabled
                initialValue="value3"
                name="input3"
                onChange={onChange}
            />
            <GenericInput
                initialValue="value3Model"
                model={{
                    declaration: 'Disabled',
                    mutable: false,
                    name: 'input3Model'
                }}
                onChange={onChange}
            />

            <hr/>

            <GenericInput
                declaration="placeholder"
                name="input4"
                onChange={onChange}
                placeholder="input4"
                required
                trailingIcon="clear_preset"
            />
            <GenericInput
                icon="backup"
                initialValue="value4Model"
                model={{
                    declaration: 'placeholder',
                    name: 'input4Model',
                    nullable: false
                }}
                onChange={onChange}
                placholder="input4Model"
                trailingIcon="clear_preset"
            />

            <hr/>

            <GenericInput
                declaration="pattern"
                description="input5Description"
                icon="search"
                initialValue="only a`s allowed"
                name="input5"
                onChange={onChange}
                pattern="a+"
                placeholder="input5Placeholder"
            />
            <GenericInput
                initialValue="only a`s allowed"
                model={{
                    declaration: 'pattern',
                    description: 'input5ModelDescription',
                    regularExpressionPattern: 'a+'
                }}
                name="input5Model"
                onChange={onChange}
                placeholder="input5ModelPlaceholder"
                trailingIcon="search"
            />

            <hr/>

            <GenericInput
                declaration="password"
                description="input6Description"
                icon="search"
                initialValue="hans"
                name="passwordInput6"
                onChange={onChange}
                pattern="a+"
                placeholder="input6Placeholder"
                tooltip="Please type in your password."
                trailingIcon="password_preset"
            />
            <GenericInput
                initialValue="hans"
                model={{
                    declaration: 'password',
                    description: 'input6ModelDescription',
                    regularExpressionPattern: 'a+',
                }}
                name="passwordInput6Model"
                onChange={onChange}
                placeholder="input6ModelPlaceholder"
                trailingIcon="password_preset"
            />

            <hr/>

            <GenericInput
                declaration="selection"
                description="input7Description"
                initialValue="A"
                name="input7"
                onChange={onChange}
                placeholder="input7Placeholder"
                selection={['A', 'B', 'C']}
                required
            />
            <GenericInput
                initialValue="A"
                model={{
                    declaration: 'selection',
                    description: 'input7ModelDescription',
                    name: 'input7Model',
                    mutable: false,
                    nullable: false,
                    selection: ['A', 'B', 'C'],
                }}
                onChange={onChange}
                placeholder="input7ModelPlaceholder"
            />

            <GenericInput
                declaration="selection"
                description="input8Description"
                initialValue="a"
                name="input8"
                onChange={onChange}
                selection={{a: 'A', b: 'B', c: 'C'}}
                required
            />
            <GenericInput
                initialValue="a"
                model={{
                    declaration: 'selection',
                    description: 'input8ModelDescription',
                    name: 'input8Model',
                    nullable: false,
                    selection: {a: 'A', b: 'B', c: 'C'},
                }}
                onChange={onChange}
            />

            <GenericInput
                declaration="text"
                description="input9Description"
                editor="text"
                initialValue="a"
                name="input9"
                onChange={onChange}
                required
                rows={3}
                theme={{
                    primary: 'yellow',
                    secondary: 'blue'
                }}
            />
            <GenericInput
                initialValue="a"
                model={{
                    declaration: 'text',
                    description: 'input9ModelDescription',
                    editor: 'text',
                    name: 'input9Model',
                    nullable: false,
                }}
                onChange={onChange}
                rows={2}
            />

            <GenericInput
                declaration="code"
                description="input10Description"
                disabled
                editor="code"
                initialValue="const value = 2"
                name="input10"
                onChange={onChange}
                rows={2}
                selectableEditor
            />
            <GenericInput
                initialValue="const value = 2"
                model={{
                    declaration: 'code',
                    description: 'input10ModelDescription',
                    editor: 'code',
                    name: 'input10Model',
                    nullable: false,
                }}
                onChange={onChange}
                rows={6}
                selectableEditor
            />

            <GenericInput
                declaration="code"
                description="input11Description"
                editor="code"
                maximumLength={10}
                name="input11"
                onChange={onChange}
                required
                rows={2}
                selectableEditor
            />
            <GenericInput
                model={{
                    declaration: 'code',
                    description: 'input11ModelDescription',
                    editor: 'code',
                    name: 'input11Model',
                    nullable: false
                }}
                onChange={onChange}
                rows={6}
                selectableEditor
            />

            <GenericInput
                declaration="richtext(raw)"
                description="input12Description"
                editor="richtext(raw)"
                name="input12"
                onChange={onChange}
                placeholder="Hello Mr. Smith,<br><br>this is a Placeholder."
                required
                rows={2}
                selectableEditor
            />
            <GenericInput
                initialValue="Hello Mr. Smith,<br><br>how are you?"
                model={{
                    declaration: 'richtext(simple)',
                    description: 'input12ModelDescription',
                    editor: 'richtext(simple)',
                    mutable: false,
                    name: 'input12Model',
                    nullable: false,
                }}
                onChange={onChange}
                rows={6}
                selectableEditor
            />

        </div>

        <pre className="outputs">{
            selectedState ?
                Tools.represent(
                    Object.keys(selectedState)
                        .filter(key => !/^on[A-Z]/.test(key))
                        .reduce(
                            (result, key) => (
                                result[key] = selectedState[key], result
                            ),
                            {}
                        )
                ) :
                ''
        }</pre>
    </>)
}
window.onload = ():Application =>
    ReactDOM.render(<Application />, document.querySelector('.app'))
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
