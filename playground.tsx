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
import React, {FunctionComponent, useEffect, useState} from 'react'
import {ReactElement} from 'react'
import {render} from 'react-dom'

import GenericAnimate from './components/GenericAnimate'
import GenericInput from './components/GenericInput'
import RequireableCheckbox from './components/RequireableCheckbox'
import {useMemorizedValue} from './helper'
import './material-fixes'
import {Properties} from './type'
// endregion
GenericInput.local = 'de-DE'
GenericInput.transformer.currency.format.final.options = {currency: 'EUR'}
const represent = (state:Properties):string => Tools.represent(
    Object.keys(state)
        .filter((key:string):boolean => !/^on[A-Z]/.test(key))
        .reduce(
            (result:Partial<Properties>, key:string):Partial<Properties> => {
                result[key as keyof Properties] =
                    state[key as keyof Properties]
                return result
            },
            {}
        )
)

const Application:FunctionComponent<{}> = ():ReactElement => {
    const [selectedState, setSelectedState] = useState<Properties>()
    const onChange = useMemorizedValue<(properties:Properties) => void>(
        setSelectedState
    )

    const [fadeState, setFadeState] = useState<boolean>(false)
    useEffect(():(() => void) => Tools.timeout(
        ():void => setFadeState((value:boolean):boolean => !value), 2 * 1000
    ).clear)

    return (<>
        <div className="inputs">

            <GenericInput onChange={onChange}/>

            <hr/>

            <GenericInput name="input1" onChange={onChange}/>
            <GenericInput
                model={useMemorizedValue({name: 'input1Model'})}
                onChange={onChange}
            />

            <hr/>

            <GenericInput name="input2" onChange={onChange}/>
            <GenericInput
                initialValue="value2Model"
                model={useMemorizedValue({name: 'input2Model'})}
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
                model={useMemorizedValue({
                    declaration: 'Disabled',
                    mutable: false,
                    name: 'input3Model'
                })}
                onChange={onChange}
            />

            <hr/>

            <GenericInput
                declaration="placeholder"
                name="input4"
                onChange={onChange}
                placeholder="100.000,00"
                required
                trailingIcon="clear_preset"
            />

            <GenericInput
                icon="backup"
                initialValue="value4Model"
                model={useMemorizedValue({
                    declaration: 'placeholder',
                    name: 'input4Model',
                    nullable: false
                })}
                onChange={onChange}
                placeholder="input4Model"
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
                model={useMemorizedValue({
                    declaration: 'pattern',
                    description: 'input5ModelDescription',
                    regularExpressionPattern: 'a+'
                })}
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
                model={useMemorizedValue({
                    declaration: 'password',
                    description: 'input6ModelDescription',
                    regularExpressionPattern: 'a+',
                })}
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
                model={useMemorizedValue({
                    declaration: 'selection',
                    description: 'input7ModelDescription',
                    name: 'input7Model',
                    mutable: false,
                    nullable: false,
                    selection: ['A', 'B', 'C'],
                })}
                onChange={onChange}
                placeholder="input7ModelPlaceholder"
            />

            <hr/>

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
                model={useMemorizedValue({
                    declaration: 'selection',
                    description: 'input8ModelDescription',
                    name: 'input8Model',
                    nullable: false,
                    selection: {a: 'A', b: 'B', c: 'C'},
                })}
                onChange={onChange}
            />

            <hr/>

            <GenericInput
                declaration="text"
                description="input9Description"
                editor="text"
                initialValue="a"
                name="input9"
                onChange={onChange}
                required
                rows={3}
                theme={useMemorizedValue({
                    primary: 'yellow',
                    secondary: 'blue'
                })}
            />
            <GenericInput
                editor="text"
                initialValue="a"
                model={useMemorizedValue({
                    declaration: 'text',
                    description: 'input9ModelDescription',
                    name: 'input9Model',
                    nullable: false,
                })}
                onChange={onChange}
                rows={2}
            />

            <hr/>

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
                editor="code"
                initialValue="const value = 2"
                model={useMemorizedValue({
                    declaration: 'code',
                    description: 'input10ModelDescription',
                    name: 'input10Model',
                    nullable: false,
                })}
                onChange={onChange}
                rows={6}
                selectableEditor
            />

            <hr/>

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
                editor="code"
                model={useMemorizedValue({
                    declaration: 'code',
                    description: 'input11ModelDescription',
                    name: 'input11Model',
                    nullable: false
                })}
                onChange={onChange}
                rows={6}
                selectableEditor
            />

            <hr/>

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
                editor="richtext(simple)"
                initialValue="Hello Mr. Smith,<br><br>how are you?"
                model={useMemorizedValue({
                    declaration: 'richtext(simple)',
                    description: 'input12ModelDescription',
                    mutable: false,
                    name: 'input12Model',
                    nullable: false
                })}
                onChange={onChange}
                rows={6}
                selectableEditor
            />

            <hr/>

            <GenericInput
                declaration="Number"
                description="input13Description"
                maximum={200000}
                minimum={10}
                name="input13"
                onChange={onChange}
                placeholder="100000"
                required
                type="number"
            />
            <GenericInput
                initialValue={100000}
                model={useMemorizedValue({
                    declaration: 'Number',
                    description: 'input13ModelDescription',
                    maximum: 200000,
                    minimum: 10,
                    name: 'input13Model',
                    nullable: false,
                    type: 'number'
                })}
                onChange={onChange}
            />

            <hr/>

            <GenericInput
                declaration="Number"
                description="input14Description"
                maximum={200000}
                minimum={10}
                name="input14"
                onChange={onChange}
                placeholder="100.000"
                required
                type="integer"
            />

            <GenericInput
                initialValue={100000.01}
                model={useMemorizedValue({
                    declaration: 'Number',
                    description: 'input14ModelDescription',
                    maximum: 200000,
                    minimum: 10,
                    name: 'input14Model',
                    nullable: false,
                    type: 'float'
                })}
                onChange={onChange}
            />

            <hr/>

            <GenericInput
                declaration="Number"
                description="input15Description"
                maximum={200000}
                minimum={10}
                name="input15"
                onChange={onChange}
                placeholder="100.000"
                required
                type="currency"
            />
            <GenericInput
                initialValue={100000.01}
                model={useMemorizedValue({
                    declaration: 'Number',
                    description: 'input15ModelDescription',
                    maximum: 200000,
                    minimum: 10,
                    name: 'input15Model',
                    nullable: false,
                    type: 'currency'
                })}
                onChange={onChange}
            />

            <hr/>

            <div style={{height: '50px'}}>
                <GenericAnimate in={fadeState}>Fade it!</GenericAnimate>
                <br/>
                <GenericAnimate children="Fade it!" in={!fadeState} />
            </div>

            <hr/>

            <RequireableCheckbox onChange={onChange} />

            <hr/>

            <RequireableCheckbox name="checkbox1" onChange={onChange} />
            <RequireableCheckbox
                model={useMemorizedValue({name: 'checkbox1Model'})}
                onChange={onChange}
            />

            <hr/>

            <RequireableCheckbox
                disabled name="checkbox2" onChange={onChange} required
            />
            <RequireableCheckbox
                model={useMemorizedValue(
                    {name: 'checkbox2Model', mutable:false, nullable: false}
                )}
                onChange={onChange}
            />

            <hr/>

            <RequireableCheckbox
                name="checkbox3"
                onChange={onChange}
                required
                showInitialValidationState
            />
            <RequireableCheckbox
                model={useMemorizedValue(
                    {name: 'checkbox3Model', nullable: false}
                )}
                onChange={onChange}
                showInitialValidationState
                tooltip="Check this one!"
            />

        </div>

        {
            selectedState &&
            <pre className="outputs">{represent(selectedState)}</pre>
        }

    </>)
}
window.onload = ():void =>
    render(<Application />, document.querySelector('.app'))
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
