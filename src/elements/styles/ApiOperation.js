import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.operation-header {
  margin-bottom: 32px;
}

.operation-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.operation-title .label {
  font-size: var(--operation-title-size, 26px);
  font-weight: var(--operation-title-weight, 400);
  margin: 8px 0px;
}

.sub-header {
  font-size: 0.95rem;
  color: var(--operation-subheader-color, #616161);
  margin: 0;
}

.params-section {
  padding-bottom: 20px;
}
`;
