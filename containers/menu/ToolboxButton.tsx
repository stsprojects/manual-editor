import MenuItem from "containers/MenuItem";
import * as React from "react";

const ToolboxButton = () => {
    return (
        <MenuItem
            menuItemId="toolbox"
            menuItemText="Toolbox"
            menuItemHeading="Create Toolbox"
            items={[
                {
                    elementState: {
                        value: [
                            {
                                description: "Tool description",
                                imgSrc: "",
                                name: "Tool Name",
                            },
                        ],
                    },
                    elementType: "Toolbox",
                },
            ]}
            insertEnabled
        />
    );
};

export default ToolboxButton;
