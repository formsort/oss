"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_embed_1 = tslib_1.__importDefault(require("@formsort/react-embed"));
const react_1 = tslib_1.__importDefault(require("react"));
const EmbedFlowExample = () => (react_1.default.createElement("div", null,
    react_1.default.createElement(react_embed_1.default, { clientLabel: "formsort", flowLabel: "onboarding", variantLabel: "main" })));
exports.default = EmbedFlowExample;
