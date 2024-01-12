import { boot } from "quasar/wrappers"

import { ref } from 'vue'

import { Amplify } from "aws-amplify"
import { Hub, I18n } from "aws-amplify/utils"
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth"

import AmplifyVue from "@aws-amplify/ui-vue"

import { translations, Authenticator } from '@aws-amplify/ui-vue'
import "@aws-amplify/ui-vue/styles.css"

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.VUE_APP_COGNITO_POOL_ID,
      userPoolClientId: process.env.VUE_APP_COGNITO_CLIENT_ID,
    }
  }
})

export const vocabularies = {
  ja: {
    'Sign In': 'サインイン',
    'Sign in': 'サインイン',
    'Signing in': 'サインイン中…',
    'Create Account': 'サインアップ（新規登録）',
    'Enter your Username': 'ユーザー名(メールアドレス)を入力',
    'Enter your Password': 'パスワードを入力',
    'Username': 'ユーザー名(メールアドレス)',
    'Code *': '確認コード',
    'Code': '確認コード',
    'Password': 'パスワード',
    'New Password': '新しいパスワード',
    'Confirm Password': '確認用パスワード',
    'Please confirm your Password': 'パスワードを入力',
    'Reset Password': 'パスワードのリセット',
    'Reset your password': 'パスワードリセット',
    'Forgot your password?': 'パスワードをお忘れですか？',
    'Resend code': '確認コードの再送',
    'Send code': '確認コードの送信',
    'Password did not conform with policy: Password not long enough':'パスワードは8文字以上にしてください',
    "2 validation errors detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6; Value at 'password' failed to satisfy constraint: Member must satisfy regular expression pattern: ^[\S]+.*[\S]+$": 'パスワードは8文字以上、大文字小文字を含む英数字を指定してください',
    'User does not exist.': 'ユーザーが存在しません',
    'Incorrect username or password.': 'ユーザー名またはパスワードが違います',
    'User is not confirmed.': 'ユーザーは検証されていません',
    'User already exists': 'ユーザーは既に存在します',
    'Invalid verification code provided, please try again.': '指定された確認コードが無効です。もう一度お試しください',
    'Invalid password format': 'パスワードのフォーマットが不正です',
    'Invalid phone number format': '不正な電話番号フォーマットです。 電話番号は次のフォーマットで入力してください: +12345678900',
    'An account with the given email already exists.': 'そのメールアドレスは既に存在します',
    'Username cannot be empty': 'ユーザー名は必須です',
    'Password attempts exceeded': 'パスワード試行回数が超過しました',
    'Password cannot be empty': 'パスワードは必須入力です',
    'Attempt limit exceeded, please try after some time.': '試行制限を超過しました。しばらくしてからもう一度お試しください',
    'Username/client id combination not found.': 'ユーザーが存在しません',
    'Your passwords must match': 'パスワードが一致していません',
    'CUSTOM_AUTH is not enabled for the client.': 'パスワードは必須です',
    'Password does not conform to policy: Password not long enough': 'パスワードは8文字以上を入力してください (8文字以上の大文字小文字を含む英数字)',
    'Password does not conform to policy: Password must have uppercase characters': 'パスワードには大文字を含めてください (8文字以上の大文字小文字を含む英数字)',
    'Password does not conform to policy: Password must have lowercase characters': 'パスワードには小文字を含めてください (8文字以上の大文字小文字を含む英数字)',
    'Password does not conform to policy: Password must have numeric characters': 'パスワードには数字を含めてください (8文字以上の大文字小文字を含む英数字)',
    'Password does not conform to policy: Password must have symbol characters': 'パスワードには記号を含めてください (8文字以上の大文字小文字を含む英数字)',
    "1 validation error detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6": 'パスワードは8文字以上、大文字小文字を含む英数字を指定してください',
  },
}

I18n.putVocabularies(vocabularies)
I18n.setLanguage('ja')

const onAuthEvent = (payload) => {
  // console.log(payload)
}

export default boot(({ app }) => {
  Hub.listen('auth', (data) => {
    const { payload } = data
    onAuthEvent(payload)
  })

   app.use(AmplifyVue)
})

const SignOut = async () => {
  try {
    // await Auth.signOut()
    await signOut()
  } catch (e) {
    console.log(e)
  }
}

const GetAccessToken = async () => {
  let accessToken = null

  try {
    await fetchAuthSession().then((res) => {
      accessToken = res.tokens.accessToken.toString()
    })
  } catch (e) {
  }
  return accessToken
}

const amplifyPlugin = {
  SignOut,
  GetAccessToken
}

export const useAmplify = () => {
  return amplifyPlugin
}
