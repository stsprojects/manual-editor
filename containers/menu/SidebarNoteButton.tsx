import MenuItem from "containers/MenuItem";
import {convertToRaw, EditorState} from "draft-js";
import * as React from "react";

class SidebarNoteButton extends React.Component<void, void> {
        public render() {
            return (
                <MenuItem
                    insertEnabled
                    menuItemHeading="Create Sidebar Note"
                    menuItemId="sidebar-note"
                    menuItemText="Sidebar Note"
                    items={[
                        {
                            elementState: {
                                value: {
                                    content: convertToRaw(EditorState.createEmpty().getCurrentContent()),
                                    imgSource: "",
                                    title: "",
                                },
                            },
                            elementType: "SidebarNote",
                        },
                    ]}
                />
            );
        }
}

export default SidebarNoteButton;
