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
      userPoolClientId: process.env.VUE_APP_COGNITO_POOL_WEBCLIENT_ID,
    }
  }
})

export const vocabularies = {
  ja: {
    [translations.BACK_TO_SIGN_IN]: 'サインインに戻る',
    [translations.CHANGE_PASSWORD_ACTION]: '変更',
    [translations.CHANGE_PASSWORD]: 'パスワードを変更',
    [translations.CODE_LABEL]: '確認コード',
    [translations.CODE_PLACEHOLDER]: '確認コードを入力',
    [translations.CONFIRM_SIGN_UP_CODE_LABEL]: '確認コード',
    [translations.CONFIRM_SIGN_UP_CODE_PLACEHOLDER]: '確認コードを入力',
    [translations.CONFIRM_SIGN_UP_HEADER_TEXT]: 'サインアップを確認',
    [translations.CONFIRM_SIGN_UP_LOST_CODE]: '確認コードがありませんか？',
    [translations.CONFIRM_SIGN_UP_RESEND_CODE]: '確認コードを再送',
    [translations.CONFIRM_SIGN_UP_SUBMIT_BUTTON_TEXT]: '確認',
    [translations.CONFIRM_SMS_CODE]: 'SMSコードを確認',
    [translations.CONFIRM_TOTP_CODE]: 'TOTPコードを確認',
    [translations.CONFIRM]: '確認',
    [translations.CREATE_ACCOUNT_TEXT]: 'アカウントを作成',
    [translations.EMAIL_LABEL]: 'Eメールアドレス *',
    [translations.EMAIL_PLACEHOLDER]: 'Eメールアドレスを入力',
    [translations.FORGOT_PASSWORD_TEXT]: 'パスワードをお忘れですか？',
    [translations.LESS_THAN_TWO_MFA_VALUES_MESSAGE]: '2つ未満のMFAタイプが利用可能です',
    [translations.NEW_PASSWORD_LABEL]: '新しいパスワード',
    [translations.NEW_PASSWORD_PLACEHOLDER]: '新しいパスワードを入力',
    [translations.NO_ACCOUNT_TEXT]: 'アカウントが未登録ですか？',
    [translations.PASSWORD_LABEL]: 'パスワード *',
    [translations.PASSWORD_PLACEHOLDER]: 'パスワードを入力',
    [translations.PHONE_LABEL]: '電話番号 *',
    [translations.PHONE_PLACEHOLDER]: '(555) 555-1212',
    [translations.QR_CODE_ALT]: 'QRコード',
    [translations.RESET_PASSWORD_TEXT]: 'パスワードをリセット',
    [translations.RESET_YOUR_PASSWORD]: 'パスワードをリセット',
    [translations.SELECT_MFA_TYPE_HEADER_TEXT]: 'MFAタイプを選択',
    [translations.SELECT_MFA_TYPE_SUBMIT_BUTTON_TEXT]: '検証',
    [translations.SEND_CODE]: '確認コードを送信',
    [translations.SUBMIT]: '送信',
    [translations.SETUP_TOTP_REQUIRED]: 'TOTPが設定されている必要があります',
    [translations.SIGN_IN_ACTION]: 'サインイン',
    [translations.SIGN_IN_HEADER_TEXT]: 'アカウントにサインイン',
    [translations.SIGN_IN_TEXT]: 'サインイン',
    [translations.SIGN_IN_WITH_AMAZON]: 'Amazonでサインイン',
    [translations.SIGN_IN_WITH_AUTH0]: 'Auth0でサインイン',
    [translations.SIGN_IN_WITH_AWS]: 'AWSでサインイン',
    [translations.SIGN_IN_WITH_FACEBOOK]: 'Facebookでサインイン',
    [translations.SIGN_IN_WITH_GOOGLE]: 'Googleでサインイン',
    [translations.SIGN_OUT]: 'サインアウト',
    [translations.SIGN_UP_EMAIL_PLACEHOLDER]: 'Eメール',
    [translations.SIGN_UP_HAVE_ACCOUNT_TEXT]: 'アカウントをお持ちですか？',
    [translations.SIGN_UP_HEADER_TEXT]: '新しいアカウントを作成',
    [translations.SIGN_UP_PASSWORD_PLACEHOLDER]: 'パスワード',
    [translations.SIGN_UP_SUBMIT_BUTTON_TEXT]: 'アカウントを作成',
    [translations.SIGN_UP_USERNAME_PLACEHOLDER]: 'ユーザー名（メールアドレス）',
    [translations.SUCCESS_MFA_TYPE]: '成功しました。MFAタイプ:',
    [translations.TOTP_HEADER_TEXT]: 'スキャンして確認コードを入力してください',
    [translations.TOTP_LABEL]: 'セキュリティコードを入力:',
    [translations.TOTP_SETUP_FAILURE]: 'TOTPセットアップに失敗しました',
    [translations.TOTP_SUBMIT_BUTTON_TEXT]: 'セキュリティトークンを検証',
    [translations.TOTP_SUCCESS_MESSAGE]: 'TOTPセットアップが成功しました',
    [translations.UNABLE_TO_SETUP_MFA_AT_THIS_TIME]: '失敗しました。現在MFA設定ができません。',
    [translations.USERNAME_LABEL]: 'ユーザー名 *',
    [translations.USERNAME_PLACEHOLDER]: 'ユーザー名を入力',
    [translations.VERIFY_CONTACT_EMAIL_LABEL]: 'Eメール',
    [translations.VERIFY_CONTACT_HEADER_TEXT]: 'アカウントの復元には確認済みの連絡先情報が必要です',
    [translations.VERIFY_CONTACT_PHONE_LABEL]: '電話番号',
    [translations.VERIFY_CONTACT_SUBMIT_LABEL]: '送信',
    [translations.VERIFY_CONTACT_VERIFY_LABEL]: '検証',
    [translations.ADDRESS_LABEL]: '住所',
    [translations.ADDRESS_PLACEHOLDER]: '住所を入力',
    [translations.NICKNAME_LABEL]: 'ニックネーム',
    [translations.NICKNAME_PLACEHOLDER]: 'ニックネームを入力',
    [translations.BIRTHDATE_LABEL]: '誕生日',
    [translations.BIRTHDATE_PLACEHOLDER]: '誕生日を入力',
    [translations.PICTURE_LABEL]: '写真のURL',
    [translations.PICTURE_PLACEHOLDER]: '写真のURLを入力',
    [translations.FAMILY_NAME_LABEL]: '苗字',
    [translations.FAMILY_NAME_PLACEHOLDER]: '苗字を入力',
    [translations.PREFERRED_USERNAME_LABEL]: '呼び名',
    [translations.PREFERRED_USERNAME_PLACEHOLDER]: '呼び名を入力',
    [translations.GENDER_LABEL]: '性別',
    [translations.GENDER_PLACEHOLDER]: '性別を入力',
    [translations.PROFILE_LABEL]: 'プロフィールURL',
    [translations.PROFILE_PLACEHOLDER]: 'プロフィールURLを入力',
    [translations.GIVEN_NAME_LABEL]: '名前',
    [translations.GIVEN_NAME_PLACEHOLDER]: '名前を入力',
    [translations.ZONEINFO_LABEL]: 'タイムゾーン',
    [translations.ZONEINFO_PLACEHOLDER]: 'タイムゾーンを入力',
    [translations.LOCALE_LABEL]: 'ロケール',
    [translations.LOCALE_PLACEHOLDER]: 'ロケールを入力',
    [translations.UPDATED_AT_LABEL]: '更新日時',
    [translations.UPDATED_AT_PLACEHOLDER]: '情報が最後に更新された時刻を入力してください',
    [translations.MIDDLE_NAME_LABEL]: 'ミドルネーム',
    [translations.MIDDLE_NAME_PLACEHOLDER]: 'ミドルネームを入力',
    [translations.WEBSITE_LABEL]: 'ウェブサイト',
    [translations.WEBSITE_PLACEHOLDER]: 'ウェブサイトを入力',
    [translations.NAME_LABEL]: 'フルネーム',
    [translations.NAME_PLACEHOLDER]: 'フルネームを入力',
    [translations.PHOTO_PICKER_TITLE]: 'タイトル',
    [translations.PHOTO_PICKER_HINT]: '補助的なテキストまたはコンテンツがこのスペースを占める可能性があります',
    [translations.PHOTO_PICKER_PLACEHOLDER_HINT]: 'プレースホルダーヒント',
    [translations.PHOTO_PICKER_BUTTON_TEXT]: 'ボタン',
    [translations.IMAGE_PICKER_TITLE]: 'プロフィール写真を追加',
    [translations.IMAGE_PICKER_HINT]: 'アップロードする前に画像をプレビューする',
    [translations.IMAGE_PICKER_PLACEHOLDER_HINT]: 'タップして画像を選択',
    [translations.IMAGE_PICKER_BUTTON_TEXT]: 'アップロード',
    [translations.PICKER_TEXT]: 'ファイルを選択',
    [translations.TEXT_FALLBACK_CONTENT]: 'フォールバックコンテンツ',
    'Signing in': 'サインイン中…',
    'Enter your Username': 'ユーザー名を入力',
    'Enter your Password': 'パスワードを入力',
    'Code *': '確認コード',
    'Code': '確認コード',
    'New Password': '新しいパスワード',
    'Confirm Password': '確認用パスワード',
    'Please confirm your Password': 'パスワードを入力',
    'Reset Password': 'パスワードのリセット',
    'Reset your password': 'パスワードリセット',
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
