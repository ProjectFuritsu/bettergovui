import {Fragment} from "react";
import {Kbd, Text} from "../../src";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    // Keys separated by "+"
    keys: {type: "text", default: "Ctrl + K"},
} satisfies Controls;

const split = (keys: string) => keys.split("+").map(key => key.trim()).filter(Boolean);

export const kbdEntry = defineEntry({
    name: "Kbd",
    category: "Typography",
    description: "A keyboard key, for shortcuts in help text. Type keys separated by + to try a combination.",
    layout: "centered",
    controls,
    render: ({keys}) => (
        <Text>
            Press{" "}
            {split(keys).map((key, index) => (
                <Fragment key={`${key}-${index}`}>
                    {index > 0 && " + "}
                    <Kbd>{key}</Kbd>
                </Fragment>
            ))}
            {" "}to search.
        </Text>
    ),
    code: values => `import { Kbd } from "bettergovregiondavaoui";

${split(values.keys).map(key => `<Kbd>${key}</Kbd>`).join(" + ")}`,
});
