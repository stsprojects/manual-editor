import removable from "components/higher-order/removable";
import EditableCode from "containers/editors/EditableCode";
import EditableHeading from "containers/editors/EditableHeading";
import EditableHtml from "containers/editors/EditableHtml";
import EditableImage from "containers/editors/EditableImage";
import EditableKeyboardShortcut from "containers/editors/EditableKeyboardShortcut";
import EditableListItem from "containers/editors/EditableListItem";
import EditableRichText from "containers/editors/EditableRichText";
import EditableSidebarNote from "containers/editors/EditableSidebarNote";
import EditableToolbox from "containers/editors/EditableToolbox";
import {ContentElementType, MetaElementType} from "core/ElementInfo";
import {isItemTreeLeaf, ItemTree} from "core/ItemTree";
import * as React from "react";

type EditableElementProps = {
    itemId: number;
};

type EditableMetaElementProps = {
    itemId: number;
    items: ItemTree[];
};

function MetaElement(Container: React.ComponentClass<{}> | React.SFC<{}>) {
    return (props: EditableMetaElementProps) => (
        <Container>
            {props.items && props.items.map(createElement)}
        </Container>
    );
}

type ElementTypes = {
    [name in ContentElementType]: React.ComponentClass<EditableElementProps> | React.SFC<EditableElementProps>;
} & {
    [name in MetaElementType]: React.ComponentClass<EditableMetaElementProps> | React.SFC<EditableMetaElementProps>;
};

let elementTypes: ElementTypes = {
    Heading : removable(EditableHeading),
    SingleImage : removable(EditableImage.EditableSingleImage),
    SideBySideImage: removable(EditableImage.EditableSideBySideImage),
    RichText : removable(EditableRichText),
    RawHtml : removable(EditableHtml),
    Code : removable(EditableCode),
    SidebarNote : removable(EditableSidebarNote),
    Toolbox: removable(EditableToolbox),
    UnorderedList: MetaElement(({children}) => <ul>{children}</ul>),
    OrderedList : MetaElement(({children}) => <ol>{children}</ol>),
    InstructionList : MetaElement(({children}) => <ol className="instruction-list">{children}</ol>),
    ListItem : removable(EditableListItem),
    Table : removable(MetaElement(({children}) => <table><tbody>{children}</tbody></table>)),
    TableRow : MetaElement(({children}) => <tr>{children}</tr>),
    TableCell : MetaElement(({children}) => <td>{children}</td>),
    TableHeader : MetaElement(({children}) => <th>{children}</th>),
    KeyboardShortcut: removable(EditableKeyboardShortcut),
    Manual: MetaElement(({children}) => <div>{children}</div>),
};

type Test = ItemTree["elementType"] & keyof ElementTypes;

export default function createElement(props: ItemTree) {
    if (isItemTreeLeaf(props)) {
        const Element = elementTypes[props.elementType];
        return <Element itemId={props.itemId} key={props.itemId} />;
    } else {
        const Element = elementTypes[props.elementType];
        return <Element itemId={props.itemId} key={props.itemId} items={props.items} />;
    }
}
