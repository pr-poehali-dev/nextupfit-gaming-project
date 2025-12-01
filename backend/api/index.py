'''
Business: API endpoints for NextUpFit game - user management, quests, progress tracking
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name, function_version, memory_limit_in_mb
Returns: HTTP response dict with statusCode, headers, body, isBase64Encoded
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    params: Dict[str, str] = event.get('queryStringParameters') or {}
    path_param: str = params.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET' and 'quests' in path_param:
            cur.execute('SELECT * FROM quests ORDER BY created_at DESC')
            quests = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(q) for q in quests], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and 'user/' in path_param:
            user_id = path_param.split('user/')[1].split('/')[0]
            cur.execute('SELECT * FROM users WHERE id = %s', (user_id,))
            user = cur.fetchone()
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(user), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and 'users' in path_param:
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            character_class = body.get('character_class')
            character_emoji = body.get('character_emoji')
            
            cur.execute(
                'INSERT INTO users (username, character_class, character_emoji) VALUES (%s, %s, %s) RETURNING *',
                (username, character_class, character_emoji)
            )
            conn.commit()
            new_user = cur.fetchone()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_user), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and 'user-quests/' in path_param:
            user_id = path_param.split('user-quests/')[1].split('/')[0]
            cur.execute('''
                SELECT uq.*, q.title, q.description, q.category, q.icon, q.total_value, q.xp_reward, q.deadline, q.tips
                FROM user_quests uq
                JOIN quests q ON uq.quest_id = q.id
                WHERE uq.user_id = %s AND uq.status = 'active'
                ORDER BY uq.started_at DESC
            ''', (user_id,))
            user_quests = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(uq) for uq in user_quests], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and 'user-quests' in path_param:
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            quest_id = body.get('quest_id')
            
            cur.execute(
                'INSERT INTO user_quests (user_id, quest_id) VALUES (%s, %s) RETURNING *',
                (user_id, quest_id)
            )
            conn.commit()
            new_user_quest = cur.fetchone()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_user_quest), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT' and 'user-quests/' in path_param:
            user_quest_id = path_param.split('user-quests/')[1].split('/')[0]
            body = json.loads(event.get('body', '{}'))
            progress = body.get('progress')
            
            cur.execute('SELECT quest_id, user_id FROM user_quests WHERE id = %s', (user_quest_id,))
            user_quest_data = cur.fetchone()
            
            if not user_quest_data:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User quest not found'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('SELECT total_value, xp_reward FROM quests WHERE id = %s', (user_quest_data['quest_id'],))
            quest_info = cur.fetchone()
            
            is_completed = progress >= quest_info['total_value']
            status = 'completed' if is_completed else 'active'
            
            if is_completed:
                cur.execute(
                    'UPDATE user_quests SET progress = %s, status = %s, completed_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *',
                    (progress, status, user_quest_id)
                )
                cur.execute(
                    'UPDATE users SET xp = xp + %s WHERE id = %s',
                    (quest_info['xp_reward'], user_quest_data['user_id'])
                )
            else:
                cur.execute(
                    'UPDATE user_quests SET progress = %s, status = %s WHERE id = %s RETURNING *',
                    (progress, status, user_quest_id)
                )
            
            conn.commit()
            updated_quest = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(updated_quest), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and 'achievements' in path_param:
            cur.execute('SELECT * FROM achievements ORDER BY category')
            achievements = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(a) for a in achievements], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and 'user-achievements/' in path_param:
            user_id = path_param.split('user-achievements/')[1].split('/')[0]
            cur.execute('''
                SELECT ua.*, a.name, a.icon, a.description, a.category
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = %s
                ORDER BY ua.earned_at DESC
            ''', (user_id,))
            user_achievements = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(ua) for ua in user_achievements], default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Endpoint not found'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()