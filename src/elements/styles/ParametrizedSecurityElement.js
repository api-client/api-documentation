import { css } from 'lit-element';

export default css`
.security-title .label {
  font-size: var(--parametrized-security-title-size, 18px);
  font-weight: var(--parametrized-security-title-weight, 500);
}

.params-title .label {
  font-size: var(--parametrized-security-params-title-size, 16px);
  font-weight: var(--parametrized-security-params-title-weight, 400);
  margin: 12px 0px;
}
`;
