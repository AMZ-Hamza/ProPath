<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'audience' => $this->audience,
            'authorUserId' => $this->author_user_id,
            'authorName' => $this->whenLoaded('author', fn() => $this->author->name),
            'publishedAt' => $this->published_at?->toISOString(),
        ];
    }
}
