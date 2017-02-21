import * as React from "react";

export type SingleImageCssClass = 
    "centered-image-tiny"
    | "centered-image-small"
    | "centered-image-medium"
    | "centered-image-large"
    | "full-width-image"
    | "side-image-small"
    | "side-image-medium"
    | "side-image-large"
    | "sidebar-icon";

export type SideBySideImageCssClass = 
    "sidebyside-image-small"
    | "sidebyside-image-large";

export interface SingleImageProps {
    className : SingleImageCssClass;
    border? : boolean;
    source : string;
    caption? : string;
    onClick? : React.EventHandler<React.SyntheticEvent<HTMLImageElement>>
}

export interface SideBySideImageProps {
    className : SideBySideImageCssClass;
    border? : boolean;
    leftSource : string;
    rightSource : string;
    caption? : string;
    onClick? : React.EventHandler<React.SyntheticEvent<HTMLDivElement>>
}

export class SingleImage extends React.Component<SingleImageProps, void> {
    private onClick = (event : React.SyntheticEvent<HTMLImageElement>) =>
         this.props.onClick !== undefined ? this.props.onClick(event) : void 0;

    public render() {
        return (
        <div className={this.props.className + (this.props.border ? " border" : "")}>
            <img src={this.props.source} onClick={this.onClick} />
            <p>{this.props.caption}</p>
         </div>);
    }
}

export class SideBySideImages extends React.Component<SideBySideImageProps, void> {
    private onClick = (event : React.SyntheticEvent<HTMLDivElement>) =>
         this.props.onClick !== undefined ? this.props.onClick(event) : void 0;

    
    public render() {
        return (
        <div className={this.props.className + (this.props.border ? " border" : "")} onClick={this.onClick}>
            <img src={this.props.leftSource} />
            <img src={this.props.rightSource} />
            <p>{this.props.caption}</p>
         </div>);
    }
}