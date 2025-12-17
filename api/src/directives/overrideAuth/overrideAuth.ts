import {
  createValidatorDirective,
  ForbiddenError,
  ValidatorDirectiveFunc,
} from '@cedarjs/graphql-server'

import { logger } from 'src/lib/logger'

export const schema = gql`
  """
  Use @overrideAuth to bypass all authentication checks on a field. Used before we set up an authentication system.
  """
  directive @overrideAuth(key: String) on FIELD_DEFINITION
`

const validate: ValidatorDirectiveFunc = ({ directiveArgs }) => {
  /**
   * Write your validation logic inside this function.
   * Validator directives do not have access to the field value, i.e. they are called before resolving the value
   *
   * - Throw an error, if you want to stop executing e.g. not sufficient permissions
   * - Validator directives can be async or sync
   * - Returned value will be ignored
   */

  logger.debug(directiveArgs, 'directiveArgs in overrideAuth directive')
  /*
    If we don't have the correct override key, throw a ForbiddenError
  */
  if (
    !directiveArgs.key ||
    directiveArgs.key !== process.env.OVERRIDE_AUTH_KEY
  ) {
    throw new ForbiddenError('Invalid authentication key. Access denied.')
  } else {
    logger.debug('Override auth successful')
  }
}

const overrideAuth = createValidatorDirective(schema, validate)

export default overrideAuth
