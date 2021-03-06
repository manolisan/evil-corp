import React from 'react';
import { Form, Control, Errors, combineForms } from 'react-redux-form';
import { connect } from 'react-redux';
import { Button, FormControl } from 'react-bootstrap';
import { Block, Inline } from 'jsxstyle';
import { parentSendMessage, providerSendMessage, userSendMessage } from '../actions/contact'




class ContactForm extends React.Component {
  handleOnSubmit(val){
    if(this.props.user.authenticated_user) {
      return this.props.parentSendMessage(val);
    } else if (this.props.user.authenticated_provider){
      return this.props.providerSendMessage(val);
    }else{
      return this.props.userSendMessage(val);
    }
  }

  render() {
    let email_info = null;
    if(this.props.user.authenticated_user) {
        email_info = null ;
      } else if (this.props.user.authenticated_provider){
          email_info = null;
      }
        else {
          email_info = (  <div>
                        <label> Email </label>
                        <Control.text
                          model=".email"
                          placeholder="username"
                          required
                          validateOn="blur"
                          component={FormControl}
                        />
                        </div>
                      );
        }
          return(
            <Form
              model="Forms.contact"
              onSubmit={(val) => this.handleOnSubmit(val)}
            >
              {email_info}
            <div className="field">
                <label> Θέμα </label>
                <Control.text
                  model=".subject"
                  placeholder="username"
                  required
                  validateOn="blur"
                  component={FormControl}
                />

                <label> Μήνυμα </label>
                <Control.text
                  model=".message"
                  component={FormControl}
                 />

                 <Button type="submit" bsStyle="primary">Υποβολή φόρμας!</Button>

            </div>
          </Form>
          );
      }

}

// Function passed in to `connect` to subscribe to Redux store updates.
// Any time it updates, mapStateToProps is called.
function mapStateToProps(state) {
  return {
    user: state.user
  };
}

// Connects React component to the redux store
// It does not modify the component class passed to it
// Instead, it returns a new, connected component class, for you to use.

export default connect(mapStateToProps,
  {parentSendMessage,
    providerSendMessage,
    userSendMessage
  })
    (ContactForm);
