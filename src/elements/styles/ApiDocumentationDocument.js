import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.documentation-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.documentation-title .label {
  font-size: var(--documentation-title-size, 32px);
  font-weight: var(--documentation-title-weight, 400);
  margin: 12px 0px;
}
`;
