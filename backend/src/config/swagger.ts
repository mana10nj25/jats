import type { OpenAPIV3 } from 'openapi-types';
import swaggerJsdoc, { type Options } from 'swagger-jsdoc';
import { env } from './env';

const swaggerDefinition: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'JATS API',
    version: '1.0.0',
    description:
      'Job Application Tracking System API documentation with JWT auth and 2FA support.'
  },
  servers: [
    { url: '/', description: 'Relative to current host' },
    { url: `http://localhost:${env.port}`, description: 'Local development' }
  ],
  tags: [
    { name: 'Health', description: 'Service readiness probe' },
    { name: 'Auth', description: 'Authentication and two-factor endpoints' },
    { name: 'Jobs', description: 'Job tracking operations' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Copy the token from the login/register response.'
      }
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid JWT',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageResponse' }
          }
        }
      }
    },
    schemas: {
      AuthCredentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'demo@example.com' },
          password: { type: 'string', minLength: 8, example: 'SuperSecure123!' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT used for authenticated calls' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '64fc2eca5f1c4a001a2b345f' },
              email: { type: 'string', format: 'email' }
            }
          }
        }
      },
      TwoFactorSetupResponse: {
        type: 'object',
        properties: {
          secret: { type: 'string', example: 'JBSWY3DPEHPK3PXP' },
          qr: { type: 'string', format: 'uri', description: 'Data URI QR code' }
        }
      },
      TwoFactorVerifyRequest: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string', minLength: 6, maxLength: 6, example: '123456' },
          secret: {
            type: 'string',
            nullable: true,
            description: 'Optional override secret, otherwise uses saved one.'
          }
        }
      },
      JobInput: {
        type: 'object',
        required: ['company', 'title', 'status'],
        properties: {
          company: { type: 'string', example: 'Acme Corp' },
          title: { type: 'string', example: 'Fullstack Engineer' },
          status: {
            type: 'string',
            enum: ['applied', 'phone-screen', 'interview', 'offer', 'rejected', 'wishlist'],
            default: 'applied'
          },
          dateApplied: { type: 'string', format: 'date-time' },
          nextFollowUp: { type: 'string', format: 'date-time' },
          notes: { type: 'string', nullable: true },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['frontend', 'remote']
          }
        }
      },
      Job: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64fc2eca5f1c4a001a2b345f' },
          id: { type: 'string', example: '64fc2eca5f1c4a001a2b345f' },
          userId: { type: 'string', example: '64fc2eca5f1c4a001a2b345f' },
          company: { type: 'string' },
          title: { type: 'string' },
          status: { type: 'string' },
          dateApplied: { type: 'string', format: 'date-time', nullable: true },
          nextFollowUp: { type: 'string', format: 'date-time', nullable: true },
          notes: { type: 'string', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      JobResponse: {
        type: 'object',
        properties: {
          job: { $ref: '#/components/schemas/Job' }
        }
      },
      JobsResponse: {
        type: 'object',
        properties: {
          jobs: { type: 'array', items: { $ref: '#/components/schemas/Job' } }
        }
      },
      MessageResponse: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Operation successful' } }
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                path: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthCredentials' }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' }
              }
            }
          },
          409: {
            description: 'Duplicate email',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthCredentials' }
            }
          }
        },
        responses: {
          200: {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' }
              }
            }
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/2fa/setup': {
      post: {
        tags: ['Auth'],
        summary: 'Generate a 2FA secret and QR code',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Secret generated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TwoFactorSetupResponse' }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/2fa/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify a 2FA token',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TwoFactorVerifyRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Token verified',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          },
          400: {
            description: 'Validation failed or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'List jobs for the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of jobs',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobsResponse' }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      },
      post: {
        tags: ['Jobs'],
        summary: 'Create a job for the authenticated user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Job created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobResponse' }
              }
            }
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/jobs/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Job identifier',
          schema: { type: 'string' }
        }
      ],
      put: {
        tags: ['Jobs'],
        summary: 'Update a job',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobInput' }
            }
          }
        },
        responses: {
          200: {
            description: 'Job updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobResponse' }
              }
            }
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Jobs'],
        summary: 'Delete a job',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Job deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          }
        }
      }
    }
  }
};

const options: Options = {
  definition: swaggerDefinition,
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: 'JATS API Docs'
};
