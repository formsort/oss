"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsx_runtime_1 = require("react/jsx-runtime");
const react_embed_1 = tslib_1.__importDefault(require("@formsort/react-embed"));
const EmbedFlowExample = () => ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(react_embed_1.default, { clientLabel: "formsort", flowLabel: "onboarding", variantLabel: "main" }) }));
exports.default = EmbedFlowExample;
