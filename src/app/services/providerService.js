import { apiEndpoint } from '../../config/app';
import createRestApiClient from './createRestApiClient';

export default () => {
  const client = createRestApiClient().withConfig({ baseURL: apiEndpoint });
  return {
    getData: () => client.request({
      method: 'GET',
      url: '/api/provider',
    }),
    changeProfile: ({ brand_name, email, telephone, address, tax_registration, bank_iban}) => client.request({
      method: 'POST',
      url: '/api/provider/changeProfile',
      data: {
        brand_name,
        email,
        telephone,
        address,
        tax_registration,
        bank_iban,
      }
    }),
    changeCredentials: ({ username, password }) => client.request({
      method: 'POST',
      url: '/api/provider/changeCredentials',
      data: {
        username,
        password
      }
    }),
    getProviderActivities: () => client.request({
      method: 'GET',
      url: '/api/provider/activities',
    }),
  };
};
