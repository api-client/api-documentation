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
`;
