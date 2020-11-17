import React from 'react';
import App from 'next/app';
import { ThemeProvider } from 'theme-ui';
import { TinaProvider, TinaCMS } from 'tinacms';
import { TinacmsGithubProvider } from 'react-tinacms-github';
import { AlpacaGitHubClient } from '../utils/githubClient';
import { NextGithubMediaStore } from 'next-tinacms-github';
import theme from '../theme';
import MakerProvider from '../providers/MakerProvider';

import Head from 'next/head';
import { Global, css } from '@emotion/core';

class MyApp extends App {
  constructor(props) {
    super(props);
    const client = new AlpacaGitHubClient({
      proxy: '/api/proxy-github',
      authCallbackRoute: '/api/create-github-access-token',
      clientId: process.env.GITHUB_CLIENT_ID,
      baseRepoFullName: process.env.REPO_FULL_NAME, // e.g: tinacms/tinacms.org,
      baseBranch: process.env.BASE_BRANCH,
      // authScope: 'repo', // for private repos
    });
    this.cms = new TinaCMS({
      enabled: props.pageProps.preview,
      apis: {
        github: client,
      },
      media: new NextGithubMediaStore(client),
      // sidebar: props.pageProps.preview,
      toolbar: props.pageProps.preview,
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <Global
          styles={css`
            @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;700&display=swap');

            @font-face {
              font-family: 'FT Base';
              src: url('/fonts/FTBase-Bold.woff2') format('woff2'),
                url('/fonts/FTBase-Bold.woff') format('woff');
              font-weight: bold;
              font-style: normal;
            }

            @font-face {
              font-family: 'FT Base';
              src: url('/fonts/FTBase-Regular.woff2') format('woff2'),
                url('/fonts/FTBase-Regular.woff') format('woff');
              font-weight: normal;
              font-style: normal;
            }

            @font-face {
              font-family: 'FT Base';
              src: url('/fonts/FTBase-Medium.woff2') format('woff2'),
                url('/fonts/FTBase-Medium.woff') format('woff');
              font-weight: 500;
              font-style: normal;
            }

            html,
            body {
              background: 'red';
            }
          `}
        />
        <TinaProvider cms={this.cms}>
          <TinacmsGithubProvider
            onLogin={enterEditMode}
            onLogout={exitEditMode}
            error={pageProps.error}
          >
            <MakerProvider>
              <Component {...pageProps} />
            </MakerProvider>
          </TinacmsGithubProvider>
        </TinaProvider>
      </ThemeProvider>
    );
  }
}

('Deprecation Notice: You are using an old authentication flow, please migrate to the new one (see https://tinacms.org/blog/upgrade-notice-improved-github-security)');
('Deprecation Notice: You are using an old authentication flow, please migrate to the new one (see https://tinacms.org/blog/upgrade-notice-improved-github-security)');

const enterEditMode = async () => {
  const token = localStorage.getItem('tinacms-github-token') || null;
  console.log('entered edit mode', token);

  const headers = new Headers();

  if (token) {
    headers.append('Authorization', 'Bearer ' + token);
  }

  const resp = await fetch('/api/preview', { headers: headers });
  const data = await resp.json();

  if (resp.status == 200) window.location.href = window.location.pathname;
  else throw new Error(data.message);
};

const exitEditMode = () => {
  return fetch('/api/reset-preview').then(() => {
    window.location.reload();
  });
};

export default MyApp;
