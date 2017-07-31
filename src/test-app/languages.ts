

export interface SupportedLanguage {
    name: string,
    aceMode: string,
    examples: { description: string, code: string }[]
}

export default `
{
  "version": "0.1.0",
  "expression": {
    "head": {
      "symbol": "structure.modifier.include-surroundings"
    },
    "args": [
      {
        "head": {
          "symbol": "structure.generator.atom-groups"
        },
        "args": [
          true,
          true,
          true,
          {
            "head": {
              "symbol": "primitive.operator.set.has"
            },
            "args": [
              {
                "head": {
                  "symbol": "primitive.constructor.set"
                },
                "args": [
                  {
                    "head": {
                      "symbol": "structure.constructor.element-symbol"
                    },
                    "args": [
                      "FE"
                    ]
                  }
                ]
              },
              {
                "head": {
                  "symbol": "structure.property.atom-static"
                },
                "args": [
                  "type_symbol"
                ]
              }
            ]
          },
          {
            "head": {
              "symbol": "structure.property.atom-static"
            },
            "args": [
              "residue-key"
            ]
          }
        ]
      },
      5,
      true
    ]
  }
}`