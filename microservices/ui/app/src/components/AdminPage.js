import React, { Component } from 'react';
import { Redirect } from 'react-router';

import Page, { Logo } from './Page';
import DataTable from './DataTable';
import { Button, SubmitButton } from './Button';
import { MessageBox } from './UtilComponents';

import './css/AdminPage.css';

class UserControl extends Component {
  render() {
    return (
      <div className="user-control-wrapper theme-text-header-idle">
        <span className="control-item user-name theme-text-accent">
          {this.props.user}
        </span>
        <span className="control-item user-action" onClick={this.props.onLogoutTriggered} >
          {this.props.controlText}
        </span>
      </div>
    )
  }
}

class Header extends Component {
  render() {
    return (
      <div className="app-header theme-text-header-normal">
        <div className="app-container">
          <div className="app-panel">
            <Logo title="Intercom Webhook" />
            <UserControl user={this.props.username} controlText={this.props.logoutText}
                         onLogoutTriggered={this.props.onLogout} />
          </div>
          <div className="app-screen-panel">
            <span className="text">{this.props.screenTitle}</span>
          </div>
        </div>
      </div>
    )
  }
}

class AdminPage extends Component {
  constructor(props) {
    super(props);

    // Decides if DataTable should clear its data on render
    this.state = {
      clearTable: false, uploadTable: false,
      redirectToMain: false, logoutText: 'Logout',
      submitStatus: 'idle', tableUploadFeedback: {}
    };

    // Bind class methods
    this.triggerTableClear = this.triggerTableClear.bind(this);
    this.triggerDataUpload = this.triggerDataUpload.bind(this);
    this.triggerLogout = this.triggerLogout.bind(this);
    this.resetMessageBox = this.resetMessageBox.bind(this);
    this.onUploadStatusChanged = this.onUploadStatusChanged.bind(this);
  }

  /*
   * Resets MessageBox by hiding it after an optional specific amount of delay.
   * @params int delay  The amount of delay in milliseconds before the reset
   */
  resetMessageBox(delay = 0) {
    if (delay === 0) {
      this.setState({ tableUploadFeedback: {} });
    } else {
      window.setTimeout((instance) => {
        instance.setState({ tableUploadFeedback: {} });
      }, delay, this);
    }
  }

  onUploadStatusChanged(status) {
    // Should change button status to provide upload feedback
    if (status !== 'error') {
      // No need to display error button
      this.setState({ submitStatus: status });
    }

    // Display a bread-crumb like message box
    if (status === 'success') {
      this.setState({
        tableUploadFeedback: { message: "Data submitted successfully", type: "info" }
      });
      // Set a timeout for this box to vanish
      this.resetMessageBox(8000);
    } else if (status === 'error') {
      this.setState({
        tableUploadFeedback: { message: "Error submitting data", type: "error" }
      });
      // Set a timeout for this box to vanish
      this.resetMessageBox(8000);
    }
  }

  triggerLogout() {
    this.setState({ logoutText: 'Logging out' });
    // Try logout
    window.auth.logout(
      (success) => {
        this.setState({ redirectToMain: true });
      },
      (error) => {
        window.appLog(error, true);
        // Reset logout text
        this.setState({ logoutText: 'Logout' });
      }
    )
  }

  triggerTableClear(event) { this.setState({ clearTable: true }); }
  triggerDataUpload(event) {
    window.appLog("Preparing to upload data...");
    this.setState({ uploadTable: true });
  }

  componentDidUpdate(prevProps, prevState) {
    // Reset clear and upload state.
    // Makes sure table doesn't auto clear or upload on next render
    this.setState({ clearTable: false, uploadTable: false });
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Ensure component doesn't enter an update loop
    return (
      this.state.clearTable !== nextState.clearTable ||
      this.state.uploadTable !== nextState.uploadTable ||
      this.state.redirectToMain !== nextState.redirectToMain ||
      this.state.logoutText !== nextState.logoutText ||
      this.state.submitStatus !== nextState.submitStatus ||
      this.state.tableUploadFeedback.message !== nextState.tableUploadFeedback.message ||
      this.state.tableUploadFeedback.type !== nextState.tableUploadFeedback.type
    );
  }

  render() {
    if (this.state.redirectToMain) { return (<Redirect to="/" />); }

    return (
      <Page className="app-page-admin">
        <Header screenTitle="Dashboard" username={this.props.username}
                logoutText={this.state.logoutText}
                onLogout={this.triggerLogout} />
        <div className="app-content app-container">
          <div className="app-control-panel">
            {
              this.state.tableUploadFeedback.message &&
              <MessageBox message={this.state.tableUploadFeedback.message}
                          type={this.state.tableUploadFeedback.type}
                          className="table-msg" />
            }
            <div className="btn-panel control-item">
              <Button className="btn-clear" text="Clear" onClick={this.triggerTableClear} />
              <SubmitButton onSubmit={this.triggerDataUpload} className="btn-login"
                            state={this.state.submitStatus} />
            </div>
          </div>
          <DataTable clearTable={this.state.clearTable} uploadTable={this.state.uploadTable}
                     notifyUploadStatus={this.onUploadStatusChanged} />
        </div>
      </Page>
    )
  }
}

export default AdminPage;
