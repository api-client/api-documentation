import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.schema-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.schema-title .label {
  font-size: var(--schema-title-size, 32px);
  font-weight: var(--schema-title-weight, 400);
  margin: 12px 0px;
}
`;
