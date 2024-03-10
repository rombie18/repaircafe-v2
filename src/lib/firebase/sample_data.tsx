export const REPARATIONS: Reparation[] = [
    {
      _id: '0',
      events: [
        {
          state_cycle: 'REGISTERED',
          timestamp: new Date('2024-03-09T16:00:00'),
        },
      ],
      item_id: '',
      remarks: '',
      state_cycle: 'REGISTERED',
      state_reparation: 'UNKNOWN',
      state_token: 'RELEASED',
      token: '',
    },
    {
      _id: '1',
      events: [
        {
          state_cycle: 'REGISTERED',
          timestamp: new Date('2024-03-09T16:00:00'),
        },
        {
          state_cycle: 'DEPOSITED',
          timestamp: new Date('2024-03-09T16:10:00'),
        },
      ],
      item_id: '',
      remarks: '',
      state_cycle: 'DEPOSITED',
      state_reparation: 'UNKNOWN',
      state_token: 'RESERVED',
      token: 'A12',
    },
    {
      _id: '2',
      events: [
        {
          state_cycle: 'REGISTERED',
          timestamp: new Date('2024-03-09T16:00:00'),
        },
        {
          state_cycle: 'DEPOSITED',
          timestamp: new Date('2024-03-09T16:10:00'),
        },
        {
          state_cycle: 'QUEUED',
          timestamp: new Date('2024-03-09T16:20:00'),
        },
      ],
      item_id: '',
      remarks: '',
      state_cycle: 'QUEUED',
      state_reparation: 'UNKNOWN',
      state_token: 'RESERVED',
      token: 'A12',
    },
    {
      _id: '3',
      events: [
        {
          state_cycle: 'REGISTERED',
          timestamp: new Date('2024-03-09T16:00:00'),
        },
        {
          state_cycle: 'DEPOSITED',
          timestamp: new Date('2024-03-09T16:10:00'),
        },
        {
          state_cycle: 'QUEUED',
          timestamp: new Date('2024-03-09T16:20:00'),
        },
        {
          state_cycle: 'PENDING',
          timestamp: new Date('2024-03-09T16:30:00'),
        },
      ],
      item_id: '',
      remarks: '',
      state_cycle: 'PENDING',
      state_reparation: 'UNKNOWN',
      state_token: 'RESERVED',
      token: 'A12',
    },
    {
      _id: '4',
      events: [
        {
          state_cycle: 'REGISTERED',
          timestamp: new Date('2024-03-09T16:00:00'),
        },
        {
          state_cycle: 'DEPOSITED',
          timestamp: new Date('2024-03-09T16:10:00'),
        },
        {
          state_cycle: 'QUEUED',
          timestamp: new Date('2024-03-09T16:20:00'),
        },
        {
          state_cycle: 'PENDING',
          timestamp: new Date('2024-03-09T16:30:00'),
        },
        {
          state_cycle: 'FINISHED',
          timestamp: new Date('2024-03-09T16:40:00'),
        },
      ],
      item_id: '',
      remarks: '',
      state_cycle: 'FINISHED',
      state_reparation: 'PARTIAL',
      state_token: 'RESERVED',
      token: 'A12',
    },
    {
      _id: '5',
      events: [
        {
          state_cycle: 'REGISTERED',
          timestamp: new Date('2024-03-09T16:00:00'),
        },
        {
          state_cycle: 'DEPOSITED',
          timestamp: new Date('2024-03-09T16:10:00'),
        },
        {
          state_cycle: 'QUEUED',
          timestamp: new Date('2024-03-09T16:20:00'),
        },
        {
          state_cycle: 'PENDING',
          timestamp: new Date('2024-03-09T16:30:00'),
        },
        {
          state_cycle: 'FINISHED',
          timestamp: new Date('2024-03-09T16:40:00'),
        },
        {
          state_cycle: 'COLLECTED',
          timestamp: new Date('2024-03-09T16:50:00'),
        },
      ],
      item_id: '',
      remarks: '',
      state_cycle: 'COLLECTED',
      state_reparation: 'PARTIAL',
      state_token: 'RELEASED',
      token: 'A12',
    },
  ];