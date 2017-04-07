import MenuItem from "containers/MenuItem";
import {convertToRaw, EditorState} from "draft-js";
import * as React from "react";

const ParagraphButton = () => {

    return <MenuItem
        insertEnabled
        menuItemText="Paragraph"
        menuItemHeading="Create Paragraph"
        menuItemId="paragraph"
        items={[
            {
                componentTypeName: "RichText",
                defaultProps: {
                    value: convertToRaw(EditorState.createEmpty().getCurrentContent()),
                },
            },
        ]}
    />;
};

export default ParagraphButton;
