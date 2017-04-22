import MenuItem from "containers/MenuItem";
import {convertToRaw, EditorState} from "draft-js";
import * as React from "react";

class KeyboardShortcutButton extends React.Component<void, void> {
        public render() {
            return (
                <MenuItem
                    insertEnabled
                    menuItemHeading="Create Keyboard Shortcut"
                    menuItemId="keyboard-shortcut"
                    menuItemText="Keyboard Shortcut"
                    items={[
                        {
                            elementState: {
                                value: {
                                    content: convertToRaw(EditorState.createEmpty().getCurrentContent()),
                                    shortcuts: [["none"], ["none"]],
                                    title: "",
                                    type: "no-shortcut",
                                },
                            },
                            elementType: "KeyboardShortcut",
                        },
                    ]}
                />
            );
        }
}

export default KeyboardShortcutButton;
