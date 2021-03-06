import ElementInfo, * as ElementTypes from "core/ElementInfo";
import { ContentState, convertFromHTML, convertToRaw } from "draft-js";
import {decode} from "he";
import {addElements, Document} from "stores/Document";

// These are used for images in the old manual style.
const legacyImagesFolder = "images/";
const legacyKeyboardIconsFolder = "keyboard-icons/";

function extractElements(parentElement: Element): ElementInfo[] {
    let encounteredIntro = !(parentElement instanceof HTMLBodyElement);
    let items: ElementInfo[] = [];
    for (let i = 0; i < parentElement.childNodes.length; ++i) {
        let currentElement = parentElement.childNodes.item(i);
        if (!encounteredIntro) {
            if (currentElement.textContent === "Introduction") {
                encounteredIntro = true;
            }
            continue;
        }
        if (currentElement.nodeType === Node.ELEMENT_NODE) {
            items = items.concat(convertCurrentElement(<Element> currentElement));
        }
        if (currentElement.nodeType === Node.TEXT_NODE && currentElement.textContent && currentElement.textContent.trim().length) {
            let parsedHtml = convertFromHTML(currentElement.textContent);
            items.push({
                elementState: {
                    value: convertToRaw(ContentState.createFromBlockArray(parsedHtml.contentBlocks, parsedHtml.entityMap)),
                },
                elementType: "RichText",
            });
        }
    }
    return items;
}

function convertCurrentElement(currentElement: Element): ElementInfo[] {
            switch (currentElement.tagName.toLowerCase()) {
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
                return [
                    {
                        elementState: {
                            level: <ElementTypes.Heading["level"]> parseInt(currentElement.tagName[1], 10),
                            value: (<HTMLElement> currentElement).innerText,
                        },
                        elementType: "Heading",
                    },
                ];
            case "ul":
            return generateMetaItem("UnorderedList", currentElement);
            case "li":
            {
                return extractElements(currentElement).map((element) => {
                    if (element.elementType === "RichText") {
                        element = {
                            elementType : "ListItem",
                            elementState : element.elementState,
                        };
                    }

                    return element;
                });
            }
            case "ol":
            {
                let elementType: ElementTypes.MetaElementType = currentElement.classList.contains("instruction-list") ? "InstructionList" : "OrderedList";
                return generateMetaItem(elementType, currentElement);
            }
            case "p":
            {
                let parsedHtml = convertFromHTML(currentElement.outerHTML);
                let content = ContentState.createFromBlockArray(parsedHtml.contentBlocks, parsedHtml.entityMap);
                return [
                    {
                        elementState: {
                            value: convertToRaw(content),
                        },
                        elementType: "RichText",
                    },
                ];
            }
            case "pre":
            return [
                generateCodeItem(<HTMLPreElement>currentElement),
            ];
            case "div":
            return [
                generateDivItem(<HTMLDivElement> currentElement),
            ];
            case "img":
            return [
                generateImageItem(<HTMLImageElement> currentElement),
            ];
            case "br":
            return [];
            case "table":
            return generateMetaItem("Table", currentElement);
            case "tbody":
            return extractElements(currentElement);
            case "tr":
            return generateMetaItem("TableRow", currentElement);
            case "th":
            return generateMetaItem("TableHeader", currentElement);
            case "td":
            return generateMetaItem("TableCell", currentElement);
            default:
                console.warn(`Unsupported Tag ${currentElement.tagName}. Imported into a Raw HTML element.`);
                return [
                    {
                        elementState: {
                            value: currentElement.outerHTML,
                        },
                        elementType: "RawHtml",
                    },
                ];
        }
}

function generateMetaItem(elementType: ElementTypes.MetaElementType, currentElement: Element) {
    let listElements: ElementInfo[] = [
        {
            elementType,
            metaItemType: "open",
        },
        {
            elementType,
            metaItemType: "close",
        },
    ];
    Array.prototype.splice.apply(listElements, (<any[]> [1, 0]).concat(extractElements(currentElement)));
    return listElements;
}

function generateCodeItem(element: HTMLPreElement): ElementInfo {
    let codeLanguage: string = "";
    let head = element.ownerDocument.head;
    for (let j = 0; j < head.children.length; ++j) {
        let headElement = head.children.item(j);
        if (headElement.tagName.toLowerCase() === "script") {
            let scriptTag = <HTMLScriptElement> headElement;
            let found = scriptTag.src.match(/([A-Za-z-]+)-highlight.js/);
            if (found) {
                codeLanguage = found[1];
                break;
            }
        }
    }
    return {
        elementState: {
            language: codeLanguage,
            value: decode(element.children[0].innerHTML),
        },
        elementType: "Code",
    };
}

function generateImageItem(element: HTMLDivElement | HTMLImageElement): ElementInfo {
    let classList = element.classList;
    const border = element.getAttribute("border") !== null || classList.contains("border");
    const captionElement = element.querySelector("p");
    const caption = captionElement ? captionElement.innerText : "";
    let className: string;
    for (let i = 0; i < classList.length; ++i) {
        if (classList.item(i).includes("image") || classList.item(i) === "sidebar-icon") {
            className = classList.item(i);
            if (className.includes("sidebyside")) {
                let leftSource = importImagePath(element.querySelectorAll("img")[0].getAttribute("src")!);
                let rightSource = importImagePath(element.querySelectorAll("img")[1].getAttribute("src")!);
                return {
                    elementState: {
                        value: {
                            border,
                            caption,
                            leftSource,
                            rightSource,
                            className: <ElementTypes.SideBySideImageClassName> className,
                        },
                    },
                    elementType: "SideBySideImage",
                };
            } else {
                let imgElement = element instanceof HTMLImageElement ? element : element.querySelector("img")!;
                let source = importImagePath(imgElement.getAttribute("src")!);
                return {
                    elementState: {
                        value: {
                            border,
                            caption,
                            source,
                            className: <ElementTypes.SingleImageClassName> className,
                        },
                    },
                    elementType: "SingleImage",
                };
            }
        }
    }
    throw new Error("Impossible error: Class-list does not contain an image class, but the className attribute does.");
}

function generateDivItem(element: HTMLDivElement): ElementInfo {
    const classList = element.classList;
    const classes = element.className;
    if (classes.includes("image") || classes.includes("sidebar-icon")) {
        return generateImageItem(element);
    } else if (classList.contains("sidebar-note")) {
        return generateSidebarNote(element);
    } else if (classList.contains("toolbox")) {
        return generateToolbox(element);
    } else if (classList.contains("keyboard-shortcut")) {
        return createKeyboardShortcut(element);
    } else {
        console.warn(`Unsupported div classes: ${classes}. Imported into a Raw HTML element`);
        return {
            elementState: {
                value: element.outerHTML,
            },
            elementType: "RawHtml",
        };
    }
}

function createKeyboardShortcut(element: HTMLDivElement): ElementInfo {
    const titleElement = element.querySelector("h2");
    const title = titleElement ? titleElement.innerText : "";
    const parsedHtml = convertFromHTML(element.querySelector("p")!.outerHTML);
    const content = convertToRaw(ContentState.createFromBlockArray(parsedHtml.contentBlocks, parsedHtml.entityMap));
    const labels = element.querySelectorAll("h3");
    switch (labels.length) {
        case 0:
        case 1:
        {
            let keyImages = element.getElementsByTagName("img");
            let keys: string[] = [];
            for (let i = 0; i < keyImages.length; ++i) {
                let image = keyImages.item(i);
                let regexMatch = image.getAttribute("src")!.match(/icon-([a-z0-9]+).svg/i)!;
                keys.push(regexMatch[1]);
            }
            return {
                elementState: {
                    value: {
                        title,
                        content,
                        shortcuts: <ElementTypes.Keys[][]> [keys],
                        type: keys.length ? "shortcut" : "no-shortcut",
                    },
                },
                elementType: "KeyboardShortcut",
            };
        }
        default:
            console.warn("Unsupported number of labels. Only importing first 2 shortcuts");
        case 2:
            let firstLabel = labels.item(0);
            let secondLabel = labels.item(1);
            let firstKeys: string[] = [];
            for (let image = firstLabel.nextElementSibling; image !== secondLabel; image = image!.nextElementSibling) {
                let regexMatch = image!.getAttribute("src")!.match(/icon-([a-z0-9]+).svg/i)!;
                firstKeys.push(regexMatch[1]);
            }
            let secondKeys: string[] = [];
            for (let image = secondLabel.nextElementSibling; image && image !== labels.item(2); image = image.nextElementSibling) {
                let regexMatch = image.getAttribute("src")!.match(/icon-([a-z0-9]+).svg/i)!;
                secondKeys.push(regexMatch[1]);
            }
            return {
                elementState: {
                    value: {
                        title,
                        content,
                        shortcuts: <ElementTypes.Keys[][]> [firstKeys, secondKeys],
                        type: "multi-shortcut",
                    },
                },
                elementType: "KeyboardShortcut",
            };
    }
}

function generateSidebarNote(element: HTMLDivElement): ElementInfo {
    const titleElement = element.querySelector("h2");
    const title = titleElement ? titleElement.innerText : "";
    const parsedHtml = convertFromHTML(element.querySelector("p") !.outerHTML);
    const content = convertToRaw(ContentState.createFromBlockArray(parsedHtml.contentBlocks, parsedHtml.entityMap));
    const imageElement = element.querySelector("img");
    const imgSource = imageElement ? imageElement.src : "";
    return {
        elementState: {
            value: {
                title,
                content,
                imgSource,
            },
        },
        elementType: "SidebarNote",
    };
}

function generateToolbox(element: HTMLDivElement): ElementInfo {
    let items = [];
    let children = extractToolboxChildren(element);
    for (let item of children) {
        let image = item.querySelector("img");
        let imgSrc = image !== null ? importImagePath(image.getAttribute("src") !) : "";
        let content = item.querySelector("p") !;
        let name = content.querySelector("b") !.innerText;
        content.removeChild(content.querySelector("b") !);
        let description = content.innerText;
        items.push({
            imgSrc,
            name,
            description,
        });
    }
    return {
        elementState: {
            value: items,
        },
        elementType: "Toolbox",
    };
}

function extractToolboxChildren(toolbox: HTMLDivElement) {
    let children = [];
    let currentChild = document.createElement("div");
    for (let i = 0; i < toolbox.children.length; i++) {
        let element = toolbox.children.item(i);
        if (element instanceof HTMLDivElement) {
            currentChild = document.createElement("div");
            children.push(element);
        } else {
            currentChild.appendChild(element.cloneNode(true));
            if (element instanceof HTMLParagraphElement) {
                children.push(currentChild);
                currentChild = document.createElement("div");
            }
        }
    }
    return children;
}

function importImagePath(imagePath: string) {
    if (imagePath.startsWith(legacyImagesFolder)) {
        return imagePath.substr(legacyImagesFolder.length).toLowerCase();
    }
    if (imagePath.startsWith(legacyKeyboardIconsFolder)) {
        return imagePath.substr(legacyKeyboardIconsFolder.length).toLowerCase();
    }
    return imagePath;
}

export default function importManualHtml(html: string): Document {
    let parser = new DOMParser();
    let oldManual = parser.parseFromString(html, "text/html");
    let newManual: Document = {
        1: {
            editing: false,
            itemId: 1,
            level: 1,
            value: oldManual.querySelector("#coverpage-title h1")!.textContent!,
        },
        2: {
            editing: false,
            itemId: 2,
            level: 2,
            value: oldManual.querySelector("#coverpage-title h2")!.textContent!,
        },
        3: {
            editing: false,
            itemId: 3,
            level: 1,
            value: "Introduction",
        },
        elementOrdering: [
            {itemId: 3, elementType: "Heading"},
        ],
        nextItemId: 4,
    };
    addElements(newManual, extractElements(oldManual.body), true);
    return newManual;
}
