import { Router } from 'express';
import { KeyController } from '../controllers/key.controller';
import { GroupController } from '../controllers/group.controller';
import { SystemSettingsController } from '../controllers/system-settings.controller';
import { StatsController } from '../controllers/stats.controller';
import { SseController } from '../controllers/sse.controller';

const router = Router();

// Stats
router.get('/stats', StatsController.getStats);
router.get('/status-stream', SseController.streamStatus);

// Key Management
router.get('/keys', KeyController.getKeys);
router.post('/keys', KeyController.createKey);
router.put('/keys/:keyId', KeyController.updateKey);
router.delete('/keys/:keyId', KeyController.deleteKey);

// Group Management
router.get('/groups', GroupController.getGroups);
router.post('/groups', GroupController.createGroup);
router.put('/groups/:groupId', GroupController.updateGroup);
router.delete('/groups/:groupId', GroupController.deleteGroup);

// System Settings
router.put('/settings/active-group', SystemSettingsController.updateActiveGroup);

export default router;