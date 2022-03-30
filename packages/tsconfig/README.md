# tsconfig

> Shared [TypeScript config](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for Formsort projects


## Install

```shell
yarn add --dev @formsort/tsconfig
```


## Usage

`tsconfig.json`

```json
{
	"extends": "@formsort/tsconfig",
	"compilerOptions": {
		"outDir": "dist",
		"target": "es2018",
		"lib": [
			"es2018"
		]
	}
}
```
