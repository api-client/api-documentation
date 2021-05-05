import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.endpoint-header {
  margin-bottom: 40px;
}

.endpoint-title {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.endpoint-title .label {
  font-size: var(--resource-title-size, 32px);
  font-weight: var(--resource-title-weight, 400);
  margin: 12px 0px;
}

.sub-header {
  font-size: 0.95rem;
  color: var(--resource-subheader-color, #616161);
  margin: 0;
}

amf-operation-document {
  margin: 60px 0;
}
`;
