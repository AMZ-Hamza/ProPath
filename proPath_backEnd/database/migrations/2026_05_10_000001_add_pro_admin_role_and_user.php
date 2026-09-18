<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $this->allowProAdminRole();

        DB::table('users')->updateOrInsert(
            ['username' => 'proAdmin'],
            [
                'name' => 'Pro Admin',
                'email' => null,
                'password' => Hash::make('123456654321'),
                'role' => 'proAdmin',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }

    public function down(): void
    {
        DB::table('users')
            ->where('role', 'proAdmin')
            ->update([
                'role' => 'admin',
                'updated_at' => now(),
            ]);

        $this->removeProAdminRole();
    }

    private function allowProAdminRole(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('proAdmin', 'admin', 'trainer', 'student') NOT NULL");
            return;
        }

        if ($driver === 'sqlite') {
            $this->rebuildSqliteUsersTable("'proAdmin', 'admin', 'trainer', 'student'");
        }
    }

    private function removeProAdminRole(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'trainer', 'student') NOT NULL");
            return;
        }

        if ($driver === 'sqlite') {
            $this->rebuildSqliteUsersTable("'admin', 'trainer', 'student'");
        }
    }

    private function rebuildSqliteUsersTable(string $allowedRoles): void
    {
        DB::statement('PRAGMA foreign_keys=OFF');
        DB::statement(<<<SQL
            CREATE TABLE users_new (
                id integer primary key autoincrement not null,
                name varchar not null,
                username varchar not null,
                email varchar null,
                password varchar not null,
                role varchar check (role in ({$allowedRoles})) not null,
                status varchar check (status in ('active', 'inactive')) not null default 'active',
                last_login_at datetime null,
                created_at datetime null,
                updated_at datetime null,
                deleted_at datetime null
            )
        SQL);
        DB::statement(<<<SQL
            INSERT INTO users_new (
                id, name, username, email, password, role, status,
                last_login_at, created_at, updated_at, deleted_at
            )
            SELECT
                id, name, username, email, password, role, status,
                last_login_at, created_at, updated_at, deleted_at
            FROM users
        SQL);
        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users_new RENAME TO users');
        DB::statement('CREATE UNIQUE INDEX users_username_unique ON users (username)');
        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
        DB::statement('PRAGMA foreign_keys=ON');
    }
};
