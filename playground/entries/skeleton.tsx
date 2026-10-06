import {Card, Group, Skeleton, Stack} from "../../src";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    // Not props: what the demo "loading card" has
    avatar: {type: "boolean", default: true},
    lines: {type: "number", min: 1, max: 6, default: 3},
    animate: {type: "boolean", default: true},
} satisfies Controls;

export const skeletonEntry = defineEntry({
    name: "Skeleton",
    category: "Feedback",
    description: "Grey placeholders in the shape of content that's still loading, so the page doesn't jump when it arrives.",
    layout: "fill",
    controls,
    render: ({avatar, lines, animate}) => (
        // aria-busy tells screen readers this area is still loading
        <Card aria-busy="true" style={{maxWidth: 420}}>
            <Stack gap="md">
                {avatar && (
                    <Group gap="sm">
                        <Skeleton circle height={40} animate={animate} />
                        <Stack gap="xs" style={{flex: 1}}>
                            <Skeleton width="45%" height={12} animate={animate} />
                            <Skeleton width="25%" height={10} animate={animate} />
                        </Stack>
                    </Group>
                )}
                <Skeleton lines={lines} height={12} animate={animate} />
            </Stack>
        </Card>
    ),
    code: values => {
        const animate = values.animate ? "" : " animate={false}";
        const avatar = values.avatar
            ? `
    <Group gap="sm">
        <Skeleton circle height={40}${animate} />
        <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton width="45%" height={12}${animate} />
            <Skeleton width="25%" height={10}${animate} />
        </Stack>
    </Group>`
            : "";
        return `import { Card, Group, Skeleton, Stack } from "bettergovregiondavaoui";

// Show this while loading; aria-busy tells screen readers the area isn't ready yet
<Card aria-busy="true">${avatar}
    <Skeleton ${values.lines > 1 ? `lines={${values.lines}} ` : ""}height={12}${animate} />
</Card>`;
    },
});
