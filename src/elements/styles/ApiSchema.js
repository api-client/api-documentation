import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.property-container {
  border-bottom: 1px var(--schema-property-border-color, #C6c6c6) solid;
  margin: 20px 0px;
}

.schema-title {
  font-size: 1.2rem;
  margin: 12px 0;
}

.schema-example {
  margin-bottom: 12px;
}

.schema-example pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  padding: 8px 4px;
}

.schema-example summary {
  font-size: 1.1rem;
  padding: 8px 12px;
  background-color: var(--api-example-title-background-color,#ff9800);
  color: var(--api-example-title-color,#000);
  border-radius: 4px;
  cursor: default;
  transition: border-radius ease-in-out 0.2s;
}

.schema-example[open] summary {
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
}
`;
