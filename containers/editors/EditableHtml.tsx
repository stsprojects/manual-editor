import EditableContent from "components/EditableContent";
import HtmlPresenter from "components/HtmlPresenter";
import PlainTextEditor from "components/PlainTextEditor";
import {createEditableStateToPropsMapper, mapBaseActionsToProps} from "DocumentMappers";
import {getCommonInteractiveEditableProps, InteractiveEditableProps} from "EditableBase";
import * as React from "react";
import * as ReactRedux from "react-redux";

class EditableRawHtml extends EditableContent<string> {};

const EditableHtml = (props: InteractiveEditableProps<string>) => {

    const {toggleIsEditing, updateValue} = getCommonInteractiveEditableProps(props);

    return <EditableRawHtml
        inputComponentClass={PlainTextEditor}
        staticComponentClass={HtmlPresenter}
        {...props}
        toggleIsEditing={toggleIsEditing}
        updateValue={updateValue}
    />;
};

export default ReactRedux.connect(createEditableStateToPropsMapper(), mapBaseActionsToProps)(EditableHtml);