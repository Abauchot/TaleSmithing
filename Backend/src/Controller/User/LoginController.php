<?php

namespace App\Controller\User;

use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

final class LoginController extends AbstractController
{
    #[Route('/api/login', name: 'app_login', methods: ['POST'])]
    #[OA\Post(
        summary: 'User login with JWT authentication',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                required: ['email', 'password'],
                properties: [
                    new OA\Property(
                    property: 'email', 
                    type: 'string', 
                    format: 'email'
                    ),

                    new OA\Property(
                    property: 'password', 
                    type: 'string', 
                    format: 'password', 
                   ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful login: Returns a JWT token upon successful authentication'
            ),
            new OA\Response(
                response: 401,
                description: 'Invalid credentials: Bad email or password provided'
            ), 
            new OA\Response(
                response: 400,
                description: 'Bad request: Missing or malformed request body'
            ),
            new OA\Response(
                response: 500,
                description: 'Server error: An unexpected error occurred on the server'
            )
        ]
    )]
    public function index(): Response
    {
        throw new \LogicException('This method should not be reached');
    }
}
