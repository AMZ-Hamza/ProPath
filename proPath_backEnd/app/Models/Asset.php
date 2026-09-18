<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    protected $fillable = [
        'entity_type',
        'entity_id',
        'category',
        'file_name',
        'mime_type',
        'size_bytes',
        'checksum_sha256',
        'storage_disk',
        'storage_path',
        'uploaded_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
        ];
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }
}
