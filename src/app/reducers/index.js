import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import * as types from '../types';
import { combineForms} from 'react-redux-form';
import user from '../reducers/user';
import ActivityList from '../reducers/ActivityShow';
import ActivityCreate from '../reducers/ActivityCreate';
import parent from '../reducers/parent';
import provider from '../reducers/provider';
import administrator from '../reducers/administrator';
import ticketPdf from '../reducers/ticketBuy';
import {reducer as notifications} from 'react-notification-system-redux';


const isFetching = (state = false, action) => {
  switch (action.type) {
    case types.CREATE_REQUEST:
      return true;
    case types.REQUEST_SUCCESS:
    case types.REQUEST_FAILURE:
      return false;
    default:
      return state;
  }
};

const initialActivityState = {
    name: '',
    location: '',
    description: '',
    date: '',
    photo: '',
    total_tickets: '',
    available_tickets: '',
    min_age: '',
    max_age: '',
    tags: '',
    price: '',
};

const initialProviderState = {
  brand_name: 'manolisAE',
  email: 'manolis.company@mail.com',
  telephone: '+302105435',
  address: 'grafeio',
  tax_registration: 'tax_reg',
  bank_iban: '5039',
  username: 'manolis_com',
  password: 'pass_com',
};

const initialUserSate = {
  name: 'manolis',
  surname: 'anastasiou',
  email: 'manolisan28@gmail.com',
  telephone: '6979978425',
  address: 'Kallistratous 18',
  birthday: '22',
  username: 'manolis',
  password: 'pass'
};

const initialParentProfile = {
  name: '',
  surname: '',
  email: '',
  telephone: '',
  address: '',
  birthday: '',
}

const initialProviderProfile = {
  brand_name: '',
  email: '',
  telephone: '',
  address: '',
  tax_registration: '',
  bank_iban: '',
}

const rootReducer = combineReducers({
  isFetching,
  user,
  administrator,
  ActivityList,
  ActivityCreate,
  parent,
  provider,
  notifications,
  ticketPdf,
  Forms: combineForms({
    providerSignUp: initialProviderState,
    userSignUp: initialUserSate,
    logIn: {username: '', password: ''},
    parentChangeProfile: initialParentProfile,
    parentChangeCredentials: {username: '', password: ''},
    parentAddCredits: {credits: 0},
    providerChangeProfile: initialProviderProfile,
    providerChangeCredentials: {username: '', password: ''},
    contact: {email: '', subject: '', message: ''},
    adminPanel: {username: '', email: ''},
    resetParent: {password: ''},
    resetProvider: {password: ''},
    filterPanel: {text: '', min_age: 0, max_age: 100, min_price: 0, max_price: 100, distance: 10, lat_lon: '37.9,23.7', tags: ''},
    newActivity: initialActivityState,
    ticketbuy: {numberOfTickets: 0},
  }, 'Forms'
  ),
});

export default rootReducer;
