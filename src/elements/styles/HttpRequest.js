import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.amf-server-selector,
.param-selector,
.form-input {
  flex: 1;
  margin: 0;
}

.params-section {
  margin: 20px 0;
}

.section-title .label {
  font-style: var(--http-request-section-title-font-size, 1.2rem);
  font-weight: var(--http-request-section-title-font-weight, 500);
}

.form-item {
  margin: 12px 0;
  display: flex;
  align-items: center;
  flex-direction: row;
}

.array-form-item {
  padding-left: 8px;
  border-left: 1px var(--http-request-array-section-border-color, rgba(0, 0, 0, 0.14)) solid;
}

.auth-selector {
  margin: 12px 0;
}
`;
