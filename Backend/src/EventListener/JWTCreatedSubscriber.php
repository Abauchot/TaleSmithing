<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\User\UserInterface;

final class JWTCreatedSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            'lexik_jwt_authentication.on_jwt_created' => 'onJWTCreated',
        ];
    }

    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();

        if (!$user instanceof UserInterface) {
            return;
        }

        $data = $event->getData();

        if (method_exists($user, 'getId')) {
            $data['id'] = $user->getId();
        }

        if (method_exists($user, 'getEmail')) {
            $data['email'] = $user->getEmail();
        }

        if (method_exists($user, 'getNickname')) {
            $data['nickname'] = $user->getNickname();
            $data['username'] = $user->getNickname();
        }

        $event->setData($data);
    }
}
