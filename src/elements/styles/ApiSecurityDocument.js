import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.security-header {
  margin-bottom: 32px;
}

.security-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.security-title .label {
  font-size: var(--security-title-size, 26px);
  font-weight: var(--security-title-weight, 400);
  margin: 8px 0px;
}

.sub-header {
  font-size: 0.95rem;
  color: var(--security-subheader-color, #616161);
  margin: 0;
}

.params-section {
  padding-bottom: 20px;
}

.param-info {
  margin: 12px 0;
}

.param-info .location {
  margin-bottom: 8px;
}

.schema-example {
  margin: 20px 0;
}

.scopes-list {
  margin: 20px 0;
  padding: 0px 12px;
}

.scope-value {
  display: block;
  margin: 8px 0px;
  padding: 8px 0;
}

.scope-value:not(:last-of-type) {
  border-bottom: 1px #e5e5e5 dashed;
}

.scope-name {
  display: block;
  font-size: 1.1rem;
  user-select: text;
}

.scope-description {
  display: block;
  margin-top: 4px;
}

.value-title {
  user-select: text;
  font-weight: 400;
  font-size: 1.2em;
}

.grant-title {
  font-size: 1.2em;
}

.flow-section {
  margin: 40px 0;
}
`;
