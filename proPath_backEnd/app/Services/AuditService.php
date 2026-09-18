<?php

namespace App\Services;

use App\Models\AuditEvent;

class AuditService
{
    public static function log(
        string $eventType,
        ?int $actorUserId,
        string $entityType,
        ?int $entityId,
        ?array $before = null,
        ?array $after = null,
        ?array $metadata = null,
    ): AuditEvent {
        return AuditEvent::create([
            'event_type' => $eventType,
            'actor_user_id' => $actorUserId,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'before' => $before,
            'after' => $after,
            'metadata' => $metadata,
        ]);
    }
}
