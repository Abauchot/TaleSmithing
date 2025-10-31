<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Doctrine entity listener that hashes User passwords on persist/update.
 */
#[AsEntityListener(event: Events::prePersist, entity: User::class)]
#[AsEntityListener(event: Events::preUpdate, entity: User::class)]
class HashUserPasswordSubscriber
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function prePersist(User $user, PrePersistEventArgs $args): void
    {
        $this->hashPassword($user);
    }

    public function preUpdate(User $user, PreUpdateEventArgs $args): void
    {
        $this->hashPassword($user);
        $em = $args->getObjectManager();
        $meta = $em->getClassMetadata(User::class);
        $em->getUnitOfWork()->recomputeSingleEntityChangeSet($meta, $user);
    }

    private function hashPassword(User $user): void
    {
        $plain = $user->getPassword();
        if (null === $plain || $plain === '') {
            return;
        }

        if (str_starts_with($plain, '$')) {
            return;
        }

        $hashed = $this->passwordHasher->hashPassword($user, $plain);
        $user->setPassword($hashed);
    }
}
