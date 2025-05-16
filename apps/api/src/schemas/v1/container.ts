export const ContainerSchema = {
  createNetwork: {
    tags: ['Container'],
    body: {
      type: 'object',
      properties: {
        initNetPayload: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            userId: { type: 'string' },
            nodeCount: { type: 'number' },
          },
          required: ['name', 'userId', 'nodeCount'],
        },
        payload: {
          type: 'object',
          properties: {
            resourceGroup: { type: 'string' },
            userId: { type: 'string' },
            vmName: { type: 'string' },
            // adminUsername: { type: 'string' },
            sshKeyName: { type: 'string' },
          },
          required: ['userId', 'resourceGroup', 'vmName', 'sshKeyName'],
        },
      },
      required: ['initNetPayload', 'payload'],
    },
  },

  generateDockerCompose: {
    tags: ['Container'],
    body: {
      type: 'object',
      properties: {
        networId: { type: 'string' },
      },
      required: ['networId'],
    },
  },

  startNetwork: {
    tags: ['Container'],
    body: {
      type: 'object',
      properties: {
        networId: { type: 'string' },
      },
      required: ['networId'],
    },
  },

  getLogs: {
    tags: ['Container'],
    params: {
      type: 'object',
      properties: {
        networkId: { type: 'string' },
      },
      required: ['networkId'],
    },
  },
};
