import { css } from 'lit-element';

export default css`
.property-container {
  display: flex;
  align-items: flex-start;
  flex-direction: row;
}

.name-column {
  width: 140px;
  margin-right: 20px;
}

.description-column {
  flex: 1;
}

.param-name {
  font-weight: 500;
  font-size: 16px;
  word-break: break-all;
}

.param-type {
  margin: 12px 0;
}

.schema-property-item {
  display: flex;
  align-items: flex-start;
  margin: 8px 0;
}

.schema-property-label {
  font-weight: 500;
  margin-right: 8px;
}

.schema-property-label.example {
  margin-top: 8px;
}

.schema-property-value {
  word-break: break-all;
}

.enum-items {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
}

.enum-items li {
  list-style: none;
}

.code-value {
  margin: 0 4px;
  padding: 0 4px;
  background-color: var(--code-background-color);
  word-break: break-all;
  white-space: pre-wrap;
}

.code-value,
.code-value code {
  font-family: var(--code-font-family);
}

.property-details {
  margin: 20px 0;
}

.property-details summary {
  margin: 20px 0;
  cursor: default;
}
.property-details summary .label {
  margin-left: 8px;
}

.example-items {
  margin: 0;
  padding: 0;
  flex: 1;
}

.example-items li {
  display: block;
  margin: 4px 0;
  padding: 4px;
  width: 100%;
  white-space: pre-wrap;
  background-color: var(--operation-params-example-background-color, var(--code-background-color));
  color: var(--operation-params-example-color, var(--code-color, inherit));
}

.shape-children {
  margin-left: 20px;
}
`;
