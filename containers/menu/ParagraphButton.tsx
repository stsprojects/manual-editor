import MenuItem from "containers/MenuItem";
import {EditorState} from "draft-js";
import * as React from "react";

const ParagraphButton = () => {

    return <MenuItem
        insertEnabled
        menuItemText="Paragraph"
        menuItemHeading="Create Paragraph"
        menuItemId="paragraph"
        elementType="RichText"
        defaultValue={{value: EditorState.createEmpty()}}
    />;
};

export default ParagraphButton;
