import { css } from 'lit-element';

export default css`
.api-description {
  margin-top: 16px;
}

.api-description arc-marked {
  margin: 0;
  padding: 0;
  padding-bottom: 20px;
}

.endpoint-url {
  margin: 20px 0;
  padding: 16px 12px;
  background-color: var(--api-endpoint-url-background-color, #2D2D2D);
  color: var(--api-endpoint-url-color, #fff);
  display: flex;
  align-items: center;
  flex-direction: row;
  font-family: var(--code-font-family);
  font-size: var(--api-endpoint-url-font-size, 1.07rem);
  border-radius: var(--api-endpoint-url-border-radius, 4px);
}

.endpoint-url .method-label {
  text-transform: uppercase;
  white-space: nowrap;
  margin: 0;
}

.endpoint-url .url-value {
  flex: 1;
  margin-left: 12px;
  word-break: break-all;
}

.property-item {
  border-bottom: 1px var(--operation-params-property-border-color, #C6c6c6) solid;
  margin: 20px 0;
}

.params-title {
  display: flex;
  align-items: center;
  flex-direction: row;
  border-bottom: 1px var(--operation-params-title-border-color, #D6D6D6) solid;
}

.params-title .label {
  font-size: var(--operation-params-title-size, 22px);
  font-weight: var(--operation-params-title-weight, 400);
  margin: 20px 0;
}

.section-toggle {
  margin-left: auto;
}

.toggle-icon {
  transition: transform 0.23s linear;
}

.opened .toggle-icon {
  transform: rotate(180deg);
}

.media-type {
  margin: 12px 0;
}

.media-type span {
  font-weight: 500;
}

.amf-media-types {
  margin: 12px 0;
}

.deprecated {
  text-decoration: line-through;
}

.deprecated-message {
  font-weight: bold;
  margin: 12px 0;
  padding: 12px 8px;
  background-color: var(--deprecated-message-background-color, #ffc107);
  color: var(--deprecated-message-color, var(--primary-text-color, #000));
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.deprecated-message .message {
  margin-left: 12px;
}

.empty-info {
  font-size: 1.1rem;
  margin-left: 24px;
  padding: 12px 0;
}
`;
