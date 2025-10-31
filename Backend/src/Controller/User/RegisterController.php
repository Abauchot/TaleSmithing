<?php

namespace App\Controller\User;

use App\Entity\User;
use OpenApi\Attributes as OA;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/register', name: 'app_register', methods: ['POST'])]
#[OA\Post(
    summary: 'User registration',
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'password', 'username'],
            properties: [
                new OA\Property(
                    property: 'email', 
                    type: 'string', 
                    format: 'email', 
                    example: 'user@example.com'
                ),
                new OA\Property(
                    property: 'password', 
                    type: 'string', 
                    format: 'password', 
                    example: 'password123'
                ),
                new OA\Property(
                    property: 'username', 
                    type: 'string', 
                    example: 'username123'
                ),
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: 'User successfully registered'
        ),
        new OA\Response(
            response: 400,
            description: 'Email, username or password missing or invalid'
        ),
        new OA\Response(
            response: 409,
            description: 'Conflict: User with this email or username already exists'
        ),
        new OA\Response(
            response: 429,
            description: 'Too Many Requests: Rate limit exceeded'
        ),
        new OA\Response(
            response: 500,
            description: 'Server error: An unexpected error occurred on the server'
        )
    ]
)]
final class RegisterController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {}

    public function __invoke(Request $request, 
    UserPasswordHasherInterface $passwordHasher, 
    EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $email = $data['email'] ?? null;
        $nickname = $data['username'] ?? null; 
        $password = $data['password'] ?? null;

        if (!$email || !$nickname || !$password) {
            return new JsonResponse(['message' => 'Email, username or password missing'], 400);
        }

        $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existingUser) {
            return new JsonResponse(['message' => 'User with this email already exists'], 409);
        }

        $existingNickname = $entityManager->getRepository(User::class)->findOneBy(['nickname' => $nickname]);
        if ($existingNickname) {
            return new JsonResponse(['message' => 'User with this username already exists'], 409);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setNickname($nickname);
        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User successfully registered'], 201);
    }
}
