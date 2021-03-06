import * as React from "react";
import {connect} from "react-redux";
import {Store} from "stores";

interface Props {
    src: string;
    actualSource?: string;
    [key: string]: any;
}

class Image extends React.Component<Props, {}> {
    public render() {
        let {actualSource, ...rest} = this.props;
        return <img {...rest} src={actualSource} />;
    }
}

function mapStateToProps(store: Store, props: Props): Props {
    let src = props.src;
    return {
        ...props,
        actualSource: store.images[src] ? store.images[src].imageUrl : src,
    };
}

export default connect(mapStateToProps, {})(Image);
